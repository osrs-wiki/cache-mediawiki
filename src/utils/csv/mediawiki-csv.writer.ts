import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";
import { promises as fs } from "fs";
import path from "path";

import type { CSVRow, CSVConfiguration } from "./csv.types";
import { generateCSV } from "./csv.writer";
import { extractTablesFromBuilder } from "./mediawiki-csv.extractor";
import type {
  ExtractedMediaWikiTable,
  TableExtractionResult,
} from "./mediawiki-csv.types";

export type MediaWikiCSVWriterOptions = {
  fileNamePrefix?: string;
  includeMetadata?: boolean;
  csvConfiguration?: CSVConfiguration;
};

/**
 * Export MediaWiki content as CSV files
 * @param builder MediaWiki builder instance with content
 * @param outputDir Directory to write CSV files to
 * @param options Export configuration options
 * @returns Array of created file paths
 */
export async function exportMediaWikiToCSV(
  builder: MediaWikiBuilder,
  outputDir: string,
  options: MediaWikiCSVWriterOptions = {}
): Promise<string[]> {
  const {
    fileNamePrefix = "mediawiki-table",
    includeMetadata = true,
    csvConfiguration = { fields: [] },
  } = options;

  // Extract tables from the builder content
  const extractionResult: TableExtractionResult =
    extractTablesFromBuilder(builder);
  const { tables } = extractionResult;

  if (tables.length === 0) {
    return [];
  }

  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });

  const createdFiles: string[] = [];

  for (let i = 0; i < tables.length; i++) {
    const table = tables[i];
    const fileName =
      tables.length === 1
        ? `${fileNamePrefix}.csv`
        : `${fileNamePrefix}-${i + 1}.csv`;

    const filePath = path.join(outputDir, fileName);

    const config = csvConfiguration;
    await writeTableToCSV(table, filePath, includeMetadata, config);
    createdFiles.push(filePath);
  }

  return createdFiles;
}

/**
 * Write a single extracted table to CSV file
 * @param table Extracted MediaWiki table data
 * @param filePath Output file path
 * @param includeMetadata Whether to include table metadata as comments
 * @param csvConfiguration CSV formatting options
 */
async function writeTableToCSV(
  table: ExtractedMediaWikiTable,
  filePath: string,
  includeMetadata: boolean,
  csvConfiguration: CSVConfiguration = { fields: [] }
): Promise<void> {
  // Convert table data to CSV format
  const csvData: CSVRow[] = [];

  // Determine column headers - use table headers or generate column names
  const columnHeaders =
    table.headers.length > 0
      ? table.headers
      : Array.from(
          { length: table.rows[0]?.length || 0 },
          (_, i) => `Column_${i + 1}`
        );

  // Add headers as first row if table has headers
  if (table.headers.length > 0) {
    const headerRow: CSVRow = {};
    table.headers.forEach((header, index) => {
      headerRow[columnHeaders[index]] = header;
    });
    csvData.push(headerRow);
  }

  // Add data rows
  table.rows.forEach((row) => {
    const csvRow: CSVRow = {};
    row.forEach((cellValue, index) => {
      const columnName = columnHeaders[index] || `Column_${index + 1}`;
      csvRow[columnName] = cellValue;
    });
    csvData.push(csvRow);
  });

  // Generate CSV content with proper headers
  const csvContent = generateCSV(csvData, {
    headers: columnHeaders,
    includeHeaders: false, // Headers are already added manually above
    delimiter: csvConfiguration.fields.length > 0 ? "," : ",",
  });

  let fileContent = csvContent;

  // Add metadata as CSV comments if requested
  if (includeMetadata) {
    const metadataLines = [
      `# MediaWiki Table Export`,
      `# Source Type: ${table.source}`,
      `# Table Index: ${table.tableIndex}`,
      `# Export Date: ${new Date().toISOString()}`,
    ];

    if (table.caption) {
      metadataLines.push(`# Caption: ${table.caption}`);
    }

    if (table.class) {
      metadataLines.push(`# Table Class: ${table.class}`);
    }

    metadataLines.push(`# Headers: ${table.headers.length}`);
    metadataLines.push(`# Data Rows: ${table.rows.length}`);
    metadataLines.push(""); // Empty line before data

    fileContent = metadataLines.join("\n") + "\n" + fileContent;
  }

  await fs.writeFile(filePath, fileContent, "utf-8");
}

/**
 * Export multiple MediaWiki builders to separate CSV files
 * @param builders Array of MediaWiki builder instances
 * @param outputDir Directory to write CSV files to
 * @param options Export configuration options
 * @returns Array of created file paths
 */
export async function exportMultipleMediaWikiToCSV(
  builders: MediaWikiBuilder[],
  outputDir: string,
  options: MediaWikiCSVWriterOptions = {}
): Promise<string[]> {
  const allCreatedFiles: string[] = [];

  for (let i = 0; i < builders.length; i++) {
    const builder = builders[i];
    const builderOptions = {
      ...options,
      fileNamePrefix: options.fileNamePrefix
        ? `${options.fileNamePrefix}-builder-${i + 1}`
        : `mediawiki-builder-${i + 1}`,
    };

    const createdFiles = await exportMediaWikiToCSV(
      builder,
      outputDir,
      builderOptions
    );

    allCreatedFiles.push(...createdFiles);
  }

  return allCreatedFiles;
}

/**
 * Export MediaWiki content to CSV with automatic file naming
 * @param builder MediaWiki builder instance
 * @param baseOutputPath Base path without extension (will add .csv)
 * @param options Export configuration options
 * @returns Array of created file paths
 */
export async function exportMediaWikiToCSVFile(
  builder: MediaWikiBuilder,
  baseOutputPath: string,
  options: MediaWikiCSVWriterOptions = {}
): Promise<string[]> {
  const outputDir = path.dirname(baseOutputPath);
  const baseName = path.basename(baseOutputPath, path.extname(baseOutputPath));

  return exportMediaWikiToCSV(builder, outputDir, {
    ...options,
    fileNamePrefix: baseName,
  });
}
