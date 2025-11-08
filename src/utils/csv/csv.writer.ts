import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

import {
  CSVData,
  CSVExportOptions,
  CSVConfiguration,
  CSVRow,
} from "./csv.types";
import { escapeCsvValue, formatValue } from "./csv.utils";

/**
 * Generates a CSV string from data array
 */
export const generateCSV = (
  data: CSVData,
  options: Pick<CSVExportOptions, "delimiter" | "includeHeaders" | "headers">
): string => {
  const delimiter = options.delimiter ?? ",";
  const includeHeaders = options.includeHeaders ?? true;

  if (data.length === 0) {
    return includeHeaders && options.headers
      ? options.headers.join(delimiter) + "\n"
      : "";
  }

  let csv = "";

  // Add headers if requested
  if (includeHeaders && options.headers) {
    csv += options.headers.map(escapeCsvValue).join(delimiter) + "\n";
  }

  // Add data rows
  for (const row of data) {
    const values = options.headers
      ? options.headers.map((header) => escapeCsvValue(row[header]))
      : Object.values(row).map(escapeCsvValue);

    csv += values.join(delimiter) + "\n";
  }

  return csv;
};

/**
 * Applies CSV configuration to transform and filter data
 */
export const applyCSVConfiguration = (
  data: CSVData,
  config: CSVConfiguration
): { data: CSVData; headers: string[] } => {
  let processedData = [...data];

  // Apply filtering
  if (config.filterFn) {
    processedData = processedData.filter(config.filterFn);
  }

  // Apply field transformations
  processedData = processedData.map((row) => {
    const newRow: CSVRow = {};

    // Apply default values
    if (config.defaultValues) {
      for (const [key, value] of Object.entries(config.defaultValues)) {
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          newRow[key] = value;
        }
      }
    }

    for (const field of config.fields) {
      let value = row[field.key];

      // Apply formatter if provided
      if (field.formatter && value !== undefined) {
        value = field.formatter(value);
      } else if (value !== undefined) {
        value = formatValue(value);
      }

      // Use field label as the key in output
      newRow[field.label] = value;
    }

    return newRow;
  });

  // Apply sorting
  if (config.sortBy) {
    const sortField = config.fields.find(
      (f) => f.key === config.sortBy || f.label === config.sortBy
    );
    if (sortField) {
      const sortKey = sortField.label;
      processedData.sort((a, b) => {
        const aVal = String(a[sortKey] ?? "");
        const bVal = String(b[sortKey] ?? "");
        return aVal.localeCompare(bVal);
      });
    }
  }

  const headers = config.fields.map((f) => f.label);

  return { data: processedData, headers };
};

/**
 * Writes CSV data to a file
 */
export const writeCSV = async (
  data: CSVData,
  options: CSVExportOptions
): Promise<void> => {
  const outputDir = options.outputDir || "./out/csv";

  // Create output directory
  await mkdir(outputDir, { recursive: true });

  // Generate CSV content
  const csvContent = generateCSV(data, options);

  // Write to file
  const filePath = join(outputDir, options.filename);
  await writeFile(filePath, csvContent, "utf8");
};

/**
 * Writes CSV data with configuration applied
 */
export const writeCSVWithConfig = async (
  data: CSVData,
  config: CSVConfiguration,
  options: Omit<CSVExportOptions, "headers">
): Promise<void> => {
  const { data: processedData, headers } = applyCSVConfiguration(data, config);

  await writeCSV(processedData, {
    ...options,
    headers,
  });
};
