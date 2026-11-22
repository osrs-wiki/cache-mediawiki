import {
  DBTableCSVRow,
  DBTableCatalogColumn,
  DBTableCatalogRow,
  SerializedDBValue,
} from "./dbtables.types";

import { CacheProvider } from "@/utils/cache2/Cache";
import { DBRow, DBTable } from "@/utils/cache2/loaders/DBRow";
import { GameVal } from "@/utils/cache2/loaders/GameVal";
import { ScriptVarType } from "@/utils/cache2/ScriptVarType";
import { DBRowID, DBTableID, ScriptVarID } from "@/utils/cache2/types";

/**
 * Sanitize a string to be safe for use as a filename
 */
export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9_\-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
};

/**
 * Format a value for CSV output, handling bigint, arrays, and special characters
 * Converts bigint to string to ensure CSV compatibility
 */
export const formatCellValue = (
  value: string | number | bigint | undefined
): string | number | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }

  // Convert bigint to string to avoid CSV issues
  if (typeof value === "bigint") {
    return value.toString();
  }

  return value;
};

/**
 * Convert a DBRow to a CSV row with column names from GameVal
 * Processes ALL columns defined in columnNames, even if row doesn't have values for them
 */
export const dbRowToCSVRow = async (
  cache: Promise<CacheProvider>,
  row: DBRow,
  columnNames: Map<number, string>,
  resolvedRowName?: string | null
): Promise<DBTableCSVRow> => {
  const csvRow: DBTableCSVRow = {
    row_id: row.id,
  };

  const rowGameVal =
    resolvedRowName === undefined
      ? await GameVal.nameFor(cache, row)
      : resolvedRowName;
  if (rowGameVal) {
    csvRow.row_name = rowGameVal;
  }

  // Get the max column index from either columnNames or row.values
  const maxColIdx = Math.max(
    columnNames.size > 0 ? Math.max(...columnNames.keys()) : -1,
    row.values.length - 1
  );

  // Process all columns up to maxColIdx
  for (let colIdx = 0; colIdx <= maxColIdx; colIdx++) {
    const columnName = columnNames.get(colIdx) || `Column_${colIdx}`;
    const columnHeader = `${colIdx} - ${columnName}`;
    const values = row.values[colIdx];

    if (!values || values.length === 0) {
      csvRow[columnHeader] = undefined;
      continue;
    }

    // Handle single value
    if (values.length === 1) {
      csvRow[columnHeader] = formatCellValue(values[0]);
    } else {
      // Handle multiple values - join with semicolon
      const formattedValues = values
        .map((v) => formatCellValue(v))
        .filter((v) => v !== undefined)
        .map((v) => String(v));
      csvRow[columnHeader] = formattedValues.join("; ");
    }
  }

  return csvRow;
};

/**
 * Extract column headers from a DBRow's values structure
 * Returns ALL columns defined in columnNames, regardless of whether
 * the first row has values for them or not.
 * Format: "index - name" (e.g., "0 - task_id")
 */
export const extractColumnHeaders = (
  rows: DBRow | DBRow[],
  columnNames: Map<number, string>
): string[] => {
  const headers: string[] = [];
  const rowList = Array.isArray(rows) ? rows : [rows];
  const maxRowColumn = rowList.reduce(
    (maximum, row) =>
      Math.max(maximum, row.values.length - 1, row.types.length - 1),
    -1
  );

  const maxColIdx = Math.max(
    columnNames.size > 0 ? Math.max(...columnNames.keys()) : -1,
    maxRowColumn
  );

  // Include all columns up to maxColIdx
  for (let colIdx = 0; colIdx <= maxColIdx; colIdx++) {
    const columnName = columnNames.get(colIdx) || `Column_${colIdx}`;
    headers.push(`${colIdx} - ${columnName}`);
  }

  return headers;
};

export const groupDBRowsByTable = (rows: DBRow[]): Map<DBTableID, DBRow[]> => {
  const groupedRows = new Map<DBTableID, DBRow[]>();

  rows.forEach((row) => {
    const tableRows = groupedRows.get(row.table) ?? [];
    tableRows.push(row);
    groupedRows.set(row.table, tableRows);
  });

  groupedRows.forEach((tableRows) =>
    tableRows.sort((left, right) => left.id - right.id)
  );

  return groupedRows;
};

export const collectDBTableIds = (
  gameValTableIds: Iterable<number>,
  rows: DBRow[],
  definitionTableIds: Iterable<number>
): DBTableID[] =>
  Array.from(
    new Set([
      ...gameValTableIds,
      ...rows.map((row) => row.table),
      ...definitionTableIds,
    ])
  )
    .sort((left, right) => left - right)
    .map((tableId) => tableId as DBTableID);

export const serializeDBValue = (
  value: string | number | bigint | undefined
): SerializedDBValue | undefined =>
  typeof value === "bigint" ? value.toString() : value;

const serializeValues = (
  values: (string | number | bigint | undefined)[] | undefined
): SerializedDBValue[] =>
  (values ?? [])
    .map(serializeDBValue)
    .filter((value): value is SerializedDBValue => value !== undefined);

export const dbTableToCatalogColumns = (
  table: DBTable,
  columnNames: Map<number, string>,
  rows: DBRow[]
): DBTableCatalogColumn[] => {
  const maxRowColumn = rows.reduce(
    (maximum, row) =>
      Math.max(maximum, row.values.length - 1, row.types.length - 1),
    -1
  );
  const maxColumn = Math.max(
    columnNames.size > 0 ? Math.max(...columnNames.keys()) : -1,
    table.types.length - 1,
    maxRowColumn
  );
  const columns: DBTableCatalogColumn[] = [];

  for (let index = 0; index <= maxColumn; index++) {
    const types: DBTableCatalogColumn["types"] = [];
    (table.types[index] ?? []).forEach((typeId) => {
      if (typeId === undefined) {
        return;
      }
      const type = ScriptVarType.forID(typeId);
      if (!type) {
        return;
      }
      types.push({
        id: typeId,
        name: type.name,
        jagexName: type.jagexName,
        typeName: type.typeName,
        baseType: type.baseType,
      });
    });

    columns.push({
      index,
      name: columnNames.get(index) ?? `Column_${index}`,
      types,
      defaultValues: serializeValues(table.defaultValues[index]),
    });
  }

  return columns;
};

export const dbRowToCatalogRow = (
  row: DBRow,
  table: DBTable,
  rowName?: string
): DBTableCatalogRow => {
  const maxColumn = Math.max(
    row.values.length - 1,
    row.types.length - 1,
    table.types.length - 1,
    table.defaultValues.length - 1
  );
  const values: (SerializedDBValue[] | null)[] = [];
  const effectiveValues: (SerializedDBValue[] | null)[] = [];
  const typeIds: (ScriptVarID[] | null)[] = [];

  for (let index = 0; index <= maxColumn; index++) {
    const rawValues = row.values[index];
    const fallbackValues = table.defaultValues[index];
    values.push(rawValues === undefined ? null : serializeValues(rawValues));
    effectiveValues.push(
      rawValues === undefined
        ? fallbackValues === undefined
          ? null
          : serializeValues(fallbackValues)
        : serializeValues(rawValues)
    );
    typeIds.push(
      row.types[index]?.filter(
        (typeId): typeId is ScriptVarID => typeId !== undefined
      ) ?? null
    );
  }

  return {
    id: row.id as DBRowID,
    name: rowName,
    values,
    effectiveValues,
    typeIds,
  };
};
