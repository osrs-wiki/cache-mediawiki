import { mkdir } from "fs/promises";

import { DBTableCSVRow, DBTableExportResult } from "./dbtables.types";
import {
  dbRowToCSVRow,
  extractColumnHeaders,
  sanitizeFilename,
} from "./dbtables.utils";

import {
  CacheFileType,
  CacheSource,
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "@/utils/cache";
import { LazyPromise } from "@/utils/cache2/LazyPromise";
import { DBTable } from "@/utils/cache2/loaders/DBRow";
import { GameVal } from "@/utils/cache2/loaders/GameVal";
import { GameValID, GameValType } from "@/utils/cache2/types";
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

  // Load all DBTables
  const tables = await DBTable.all(cache);
  if (!tables || tables.length === 0) {
    console.log("No DBTables found in cache");
    return;
  }

  console.log(`Found ${tables.length} DBTables`);

  const results: DBTableExportResult[] = [];
  let successCount = 0;
  let errorCount = 0;

  // Process each table
  for (const table of tables) {
    try {
      console.log(`\nProcessing table ${table.id}...`);

      // Load GameVal for table name and column headers
      const gameVal = await GameVal.load(
        cache,
        GameValType.DBTables as GameValID,
        table.id
      );
      const tableName = gameVal?.name || `Table_${table.id}`;
      const columnNames = gameVal?.files || new Map<number, string>();

      console.log(`  Table name: ${tableName}`);
      console.log(`  Columns defined: ${columnNames.size}`);

      // Load all rows for this table
      const rows = await DBTable.loadRows(cache, table.id);
      if (!rows || rows.length === 0) {
        console.log(`  ⚠️  No rows found, skipping`);
        results.push({
          tableId: table.id,
          tableName,
          filename: "",
          rowCount: 0,
          error: "No rows found",
        });
        continue;
      }

      console.log(`  Rows found: ${rows.length}`);

      // Build CSV data
      const csvData: DBTableCSVRow[] = [];

      // Convert each row to CSV format
      for (const row of rows) {
        const csvRow = await dbRowToCSVRow(cache, row, columnNames);
        csvData.push(csvRow);
      }

      // Extract headers from first row's structure
      const dataHeaders =
        rows.length > 0 ? extractColumnHeaders(rows[0], columnNames) : [];

      // Build full header list
      const headers = ["row_id", "row_name", ...dataHeaders];

      // Write CSV file
      const sanitizedName = sanitizeFilename(tableName);
      const filename = `${table.id} - ${sanitizedName}.csv`;

      await writeCSV(csvData, {
        filename,
        headers,
        outputDir: dir,
        includeHeaders: true,
      });

      console.log(`  ✅ Exported to ${filename}`);

      results.push({
        tableId: table.id,
        tableName,
        filename,
        rowCount: rows.length,
      });

      successCount++;
    } catch (error) {
      console.error(`  ❌ Error processing table ${table.id}:`, error);
      errorCount++;

      results.push({
        tableId: table.id,
        tableName: `Table_${table.id}`,
        filename: "",
        rowCount: 0,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("Export Summary");
  console.log("=".repeat(60));
  console.log(`Total tables: ${tables.length}`);
  console.log(`Successfully exported: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
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
