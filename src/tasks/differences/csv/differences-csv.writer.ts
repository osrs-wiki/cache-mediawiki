import { mkdir } from "fs/promises";

import { convertDifferencesToCSV } from "./differences-csv.transformer";
import {
  DifferencesCSVRow,
  CSVExportConfig,
  CSVOutputFiles,
} from "./differences-csv.types";
import { CacheDifferences, Difference } from "../differences.types";

import { writeCSVWithConfig, CSVConfiguration } from "@/utils/csv";

/**
 * CSV field configurations for different output formats
 */
const csvConfigurations = {
  summary: {
    fields: [
      { key: "indexId", label: "Index ID" },
      { key: "indexName", label: "Index Name" },
      { key: "archiveId", label: "Archive ID" },
      { key: "fileId", label: "File ID" },
      { key: "changeType", label: "Change Type" },
      { key: "entityId", label: "Entity ID" },
      { key: "entityName", label: "Entity Name" },
      { key: "url", label: "URL" },
    ],
    sortBy: "indexId",
  } as CSVConfiguration,

  detailed: {
    fields: [
      { key: "indexId", label: "Index ID" },
      { key: "indexName", label: "Index Name" },
      { key: "archiveId", label: "Archive ID" },
      { key: "fileId", label: "File ID" },
      { key: "changeType", label: "Change Type" },
      { key: "entityId", label: "Entity ID" },
      { key: "entityName", label: "Entity Name" },
      { key: "fieldName", label: "Field Name" },
      { key: "oldValue", label: "Old Value" },
      { key: "newValue", label: "New Value" },
      { key: "url", label: "URL" },
      { key: "timestamp", label: "Timestamp" },
    ],
    sortBy: "indexId",
  } as CSVConfiguration,
};

/**
 * Writes cache differences to multiple CSV files
 */
export const writeDifferencesCSV = async (
  differences: CacheDifferences,
  config: CSVExportConfig
): Promise<CSVOutputFiles> => {
  // Ensure output directory exists
  await mkdir(config.outputDir, { recursive: true });

  // Convert differences to CSV rows
  const csvRows = convertDifferencesToCSV(differences, config);

  // Generate base filename
  const baseFilename = `${config.version}-differences`;

  const outputFiles: CSVOutputFiles = {
    summary: `${baseFilename}-summary.csv`,
    detailed: `${baseFilename}-detailed.csv`,
    byIndex: {},
    byChangeType: {
      added: `${baseFilename}-added.csv`,
      removed: `${baseFilename}-removed.csv`,
      changed: `${baseFilename}-changed.csv`,
    },
  };

  // Write summary CSV (one row per file change, aggregated)
  const summaryRows = aggregateToSummary(csvRows);
  await writeCSVWithConfig(summaryRows, csvConfigurations.summary, {
    filename: outputFiles.summary,
    outputDir: config.outputDir,
  });

  // Write detailed CSV (one row per field change)
  await writeCSVWithConfig(csvRows, csvConfigurations.detailed, {
    filename: outputFiles.detailed,
    outputDir: config.outputDir,
  });

  // Write index-specific CSV files
  const rowsByIndex = groupBy(csvRows, "indexId");
  for (const [indexId, indexRows] of Object.entries(rowsByIndex)) {
    const filename = `${baseFilename}-index-${indexId}.csv`;
    outputFiles.byIndex[parseInt(indexId, 10)] = filename;

    await writeCSVWithConfig(indexRows, csvConfigurations.detailed, {
      filename,
      outputDir: config.outputDir,
    });
  }

  // Write change type specific CSV files
  const rowsByChangeType = groupBy(csvRows, "changeType");
  for (const [changeType, changeRows] of Object.entries(rowsByChangeType)) {
    const filename = outputFiles.byChangeType[changeType as Difference];

    if (filename) {
      await writeCSVWithConfig(changeRows, csvConfigurations.detailed, {
        filename,
        outputDir: config.outputDir,
      });
    } else {
      // Warn if an unexpected change type is encountered
      console.warn(
        `[differences-csv.writer] Unexpected changeType '${changeType}' encountered. No CSV file will be written for these rows.`
      );
    }
  }

  return outputFiles;
};

/**
 * Groups CSV rows by a specific field
 */
const groupBy = <T extends Record<string, unknown>>(
  rows: T[],
  field: keyof T
): Record<string, T[]> => {
  const groups: Record<string, T[]> = {};

  for (const row of rows) {
    const key = String(row[field]);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(row);
  }

  return groups;
};

/**
 * Aggregates detailed rows into summary format (one row per file)
 */
const aggregateToSummary = (rows: DifferencesCSVRow[]): DifferencesCSVRow[] => {
  const summaryMap = new Map<string, DifferencesCSVRow>();

  for (const row of rows) {
    const key = `${row.indexId}-${row.archiveId}-${row.fileId}-${row.changeType}`;

    if (!summaryMap.has(key)) {
      // Create summary row with key fields only
      summaryMap.set(key, {
        indexId: row.indexId,
        indexName: row.indexName,
        archiveId: row.archiveId,
        fileId: row.fileId,
        changeType: row.changeType,
        entityId: row.entityId,
        entityName: row.entityName,
        url: row.url,
        timestamp: row.timestamp,
      });
    }
  }

  return Array.from(summaryMap.values());
};
