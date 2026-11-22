import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

import {
  identifyDBTable,
  loadDBTableIdentifications,
} from "./dbtables.identification";
import {
  DBTableCatalog,
  DBTableCatalogTable,
  DBTableCSVRow,
  DBTableExportResult,
} from "./dbtables.types";
import {
  collectDBTableIds,
  dbRowToCSVRow,
  dbRowToCatalogRow,
  dbTableToCatalogColumns,
  extractColumnHeaders,
  groupDBRowsByTable,
  sanitizeFilename,
} from "./dbtables.utils";

import {
  CacheFileType,
  CacheSource,
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "@/utils/cache";
import { LazyPromise } from "@/utils/cache2/LazyPromise";
import { DBRow, DBTable } from "@/utils/cache2/loaders/DBRow";
import { GameVal } from "@/utils/cache2/loaders/GameVal";
import { DBTableID, GameValID, GameValType } from "@/utils/cache2/types";
import { writeCSV } from "@/utils/csv/csv.writer";

/**
 * Export all DBTables and their DBRows to CSV files
 *
 * Creates one CSV file per table with:
 * - row_id column (DBRow ID)
 * - row_name column (DBRow GameVal name)
 * - Data columns with names from DBTable GameVal files
 */
const exportDBTablesToCSV = async (
  method: CacheSource,
  version: string,
  type: CacheFileType
): Promise<void> => {
  console.log(`Starting DBTables export for cache version: ${version}`);

  const cache = new LazyPromise(() =>
    method === "github"
      ? getCacheProviderGithub(version)
      : getCacheProviderLocal(version, type)
  ).asPromise();

  // Create output directory
  const dir = `./out/dbtables/${version}`;
  await mkdir(dir, { recursive: true });
  console.log(`Output directory: ${dir}`);
  const identificationsPath = join(
    process.cwd(),
    "cache-identification",
    "dbtables.json"
  );
  const identifications = await loadDBTableIdentifications(identificationsPath);

  const [loadedTableGameVals, loadedRowGameVals, allRows, cacheProvider] =
    await Promise.all([
      GameVal.all(cache, GameValType.DBTables as GameValID),
      GameVal.all(cache, GameValType.DBRows as GameValID),
      DBRow.all(cache),
      cache,
    ]);
  const tableGameVals = loadedTableGameVals ?? new Map();
  const rowGameVals = loadedRowGameVals ?? new Map();
  const tableDefinitionArchive = await cacheProvider.getArchive(
    DBTable.index,
    DBTable.archive
  );
  const definitionTableIds = tableDefinitionArchive
    ? Array.from(tableDefinitionArchive.getFiles().keys())
    : [];
  const rowsByTable = groupDBRowsByTable(allRows);
  const tableIds = collectDBTableIds(
    tableGameVals.keys(),
    allRows,
    definitionTableIds
  );

  if (tableIds.length === 0) {
    console.log("No DBTables found in cache");
    return;
  }

  console.log(`Found ${tableIds.length} DBTable identities`);
  console.log(`Found ${allRows.length} DBRows`);

  const results: DBTableExportResult[] = [];
  const catalogTables: DBTableCatalogTable[] = [];
  let successCount = 0;
  let errorCount = 0;

  for (const tableIdValue of tableIds) {
    const tableId = tableIdValue as DBTableID;
    try {
      console.log(`\nProcessing table ${tableId}...`);

      const table =
        (await DBTable.load(cache, tableId)) ?? new DBTable(tableId);
      const gameVal = tableGameVals.get(tableId);
      const tableName = gameVal?.name || `Table_${tableId}`;
      const columnNames = gameVal?.files || new Map<number, string>();
      const rows = rowsByTable.get(tableId) ?? [];

      console.log(`  Table name: ${tableName}`);
      console.log(`  Columns defined: ${columnNames.size}`);
      console.log(`  Rows found: ${rows.length}`);

      const csvData: DBTableCSVRow[] = await Promise.all(
        rows.map((row) =>
          dbRowToCSVRow(
            cache,
            row,
            columnNames,
            rowGameVals.get(row.id)?.name ?? null
          )
        )
      );
      const dataHeaders = extractColumnHeaders(rows, columnNames);
      const headers = ["row_id", "row_name", ...dataHeaders];
      const sanitizedName = sanitizeFilename(tableName);
      const filename = `${tableId} - ${sanitizedName}.csv`;

      await writeCSV(csvData, {
        filename,
        headers,
        outputDir: dir,
        includeHeaders: true,
      });

      console.log(`  ✅ Exported to ${filename}`);

      results.push({
        tableId,
        tableName,
        filename,
        rowCount: rows.length,
      });
      catalogTables.push({
        id: tableId,
        name: tableName,
        schemaLight: !table.types.some(Boolean),
        identification: identifyDBTable(identifications, tableName),
        rowCount: rows.length,
        columns: dbTableToCatalogColumns(table, columnNames, rows),
        rows: rows.map((row) =>
          dbRowToCatalogRow(row, table, rowGameVals.get(row.id)?.name)
        ),
      });

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error processing table ${tableId}:`, error);
      errorCount++;

      results.push({
        tableId,
        tableName: `Table_${tableId}`,
        filename: "",
        rowCount: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const catalog: DBTableCatalog = {
    schemaVersion: 1,
    cacheVersion: version,
    tableCount: catalogTables.length,
    rowCount: catalogTables.reduce((total, table) => total + table.rowCount, 0),
    schemaTableCount: catalogTables.filter((table) => !table.schemaLight)
      .length,
    schemaLightTableCount: catalogTables.filter((table) => table.schemaLight)
      .length,
    tables: catalogTables,
  };
  await writeFile(
    `${dir}/catalog.json`,
    JSON.stringify(catalog, (_key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

  console.log("\n" + "=".repeat(60));
  console.log("Export Summary");
  console.log("=".repeat(60));
  console.log(`Total table identities: ${tableIds.length}`);
  console.log(`Total rows: ${catalog.rowCount}`);
  console.log(`Successfully exported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
  console.log(`Catalog: ${dir}/catalog.json`);
  console.log(`Output directory: ${dir}`);
  console.log("=".repeat(60));

  // Print errors if any
  if (errorCount > 0) {
    console.log("\nTables with errors:");
    results
      .filter((r) => r.error)
      .forEach((r) => {
        console.log(`  - Table ${r.tableId} (${r.tableName}): ${r.error}`);
      });
  }
};

export default exportDBTablesToCSV;
