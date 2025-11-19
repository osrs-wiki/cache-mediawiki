import { DBTableCSVRow } from "./dbtables.types";

import { CacheProvider } from "@/utils/cache2/Cache";
import { DBRow } from "@/utils/cache2/loaders/DBRow";
import { GameVal } from "@/utils/cache2/loaders/GameVal";

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
  columnNames: Map<number, string>
): Promise<DBTableCSVRow> => {
  const csvRow: DBTableCSVRow = {
    row_id: row.id,
  };

  // Load DBRow's GameVal name
  const rowGameVal = await GameVal.nameFor(cache, row);
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
  row: DBRow,
  columnNames: Map<number, string>
): string[] => {
  const headers: string[] = [];

  // Get the max column index from either columnNames or row.values
  const maxColIdx = Math.max(
    columnNames.size > 0 ? Math.max(...columnNames.keys()) : -1,
    row.values.length - 1
  );

  // Include all columns up to maxColIdx
  for (let colIdx = 0; colIdx <= maxColIdx; colIdx++) {
    const columnName = columnNames.get(colIdx) || `Column_${colIdx}`;
    headers.push(`${colIdx} - ${columnName}`);
  }

  return headers;
};
