import {
  DifferencesCSVRow,
  EntityFormatter,
  CSVExportConfig,
} from "./differences-csv.types";
import {
  CacheDifferences,
  Result,
  ChangedResult,
  ResultValue,
} from "../differences.types";

import { indexNameMap } from "@/mediawiki/pages/differences";
import { IndexType } from "@/utils/cache2";
import { formatValue, objectToString } from "@/utils/csv";

/**
 * Default entity formatter that works for most cache types
 */
const defaultEntityFormatter: EntityFormatter = {
  getEntityId: (result: Record<string, unknown>) => {
    // Try common ID field names
    const id = result.id || result.itemId || result.npcId || result.objectId;
    return typeof id === "string" || typeof id === "number" ? id : undefined;
  },

  getEntityName: (result: Record<string, unknown>) => {
    // Try common name field names
    const name = result.name || result.title || result.displayName;
    return typeof name === "string" ? name : undefined;
  },

  shouldIncludeField: () => true,
};

/**
 * Converts a cache differences structure to CSV rows
 */
export const convertDifferencesToCSV = (
  differences: CacheDifferences,
  config: CSVExportConfig,
  entityFormatter: EntityFormatter = defaultEntityFormatter
): DifferencesCSVRow[] => {
  const rows: DifferencesCSVRow[] = [];
  const timestamp = config.includeTimestamp
    ? new Date().toISOString()
    : undefined;

  for (const [indexIdStr, indexDifferences] of Object.entries(differences)) {
    const indexId = parseInt(indexIdStr, 10);
    const indexName = getIndexName(indexId);

    for (const [archiveIdStr, archiveDifferences] of Object.entries(
      indexDifferences
    )) {
      const archiveId = parseInt(archiveIdStr, 10);

      for (const [fileIdStr, fileDifferences] of Object.entries(
        archiveDifferences
      )) {
        const fileId = parseInt(fileIdStr, 10);

        // Process added items
        if (fileDifferences.added) {
          rows.push(
            ...processResult(
              fileDifferences.added,
              "added",
              { indexId, indexName, archiveId, fileId, timestamp },
              entityFormatter,
              config
            )
          );
        }

        // Process removed items
        if (fileDifferences.removed) {
          rows.push(
            ...processResult(
              fileDifferences.removed,
              "removed",
              { indexId, indexName, archiveId, fileId, timestamp },
              entityFormatter,
              config
            )
          );
        }

        // Process changed items
        if (fileDifferences.changed) {
          rows.push(
            ...processChangedResult(
              fileDifferences.changed,
              "changed",
              { indexId, indexName, archiveId, fileId, timestamp },
              entityFormatter,
              config
            )
          );
        }
      }
    }
  }

  return rows;
};

/**
 * Gets the human-readable name for an index
 */
const getIndexName = (indexId: number): string => {
  const indexFeatureMap = indexNameMap[indexId as IndexType];
  if (indexFeatureMap && "name" in indexFeatureMap) {
    return indexFeatureMap.name;
  }
  return `Index ${indexId}`;
};

/**
 * Processes a Result object (added/removed) into CSV rows
 */
const processResult = (
  result: Result,
  changeType: "added" | "removed",
  context: {
    indexId: number;
    indexName: string;
    archiveId: number;
    fileId: number;
    timestamp?: string;
  },
  entityFormatter: EntityFormatter,
  config: CSVExportConfig
): DifferencesCSVRow[] => {
  const rows: DifferencesCSVRow[] = [];

  // Get entity info once for this result
  const entityId = entityFormatter.getEntityId?.(result);
  const entityName = entityFormatter.getEntityName?.(result);
  const url =
    config.includeURLs && entityId && entityFormatter.getEntityUrl
      ? entityFormatter.getEntityUrl(entityId, context.fileId)
      : undefined;

  for (const [fieldName, value] of Object.entries(result)) {
    if (entityFormatter.shouldIncludeField?.(fieldName) === false) {
      continue;
    }

    const formattedValue = formatResultValue(value, config.flattenObjects);

    rows.push({
      indexId: context.indexId,
      indexName: context.indexName,
      archiveId: context.archiveId,
      fileId: context.fileId,
      changeType,
      entityId,
      entityName,
      fieldName,
      [changeType === "added" ? "newValue" : "oldValue"]: formattedValue,
      url,
      timestamp: context.timestamp,
    });
  }

  return rows;
};

/**
 * Processes a ChangedResult object into CSV rows
 */
const processChangedResult = (
  changedResult: ChangedResult,
  changeType: "changed",
  context: {
    indexId: number;
    indexName: string;
    archiveId: number;
    fileId: number;
    timestamp?: string;
  },
  entityFormatter: EntityFormatter,
  config: CSVExportConfig
): DifferencesCSVRow[] => {
  const rows: DifferencesCSVRow[] = [];

  // Extract entity info from the first field change (they should all be for the same entity)
  const firstFieldKey = Object.keys(changedResult)[0];
  const firstChange = changedResult[firstFieldKey];

  let entityId: string | number | undefined;
  let entityName: string | undefined;

  if (
    firstChange &&
    typeof firstChange.newValue === "object" &&
    firstChange.newValue !== null
  ) {
    entityId = entityFormatter.getEntityId?.(
      firstChange.newValue as Record<string, unknown>
    );
    entityName = entityFormatter.getEntityName?.(
      firstChange.newValue as Record<string, unknown>
    );
  } else if (
    firstChange &&
    typeof firstChange.oldValue === "object" &&
    firstChange.oldValue !== null
  ) {
    entityId = entityFormatter.getEntityId?.(
      firstChange.oldValue as Record<string, unknown>
    );
    entityName = entityFormatter.getEntityName?.(
      firstChange.oldValue as Record<string, unknown>
    );
  }

  const url =
    config.includeURLs && entityId && entityFormatter.getEntityUrl
      ? entityFormatter.getEntityUrl(entityId, context.fileId)
      : undefined;

  for (const [fieldName, change] of Object.entries(changedResult)) {
    if (entityFormatter.shouldIncludeField?.(fieldName) === false) {
      continue;
    }

    const oldValue = formatResultValue(change.oldValue, config.flattenObjects);
    const newValue = formatResultValue(change.newValue, config.flattenObjects);

    rows.push({
      indexId: context.indexId,
      indexName: context.indexName,
      archiveId: context.archiveId,
      fileId: context.fileId,
      changeType,
      entityId,
      entityName,
      fieldName,
      oldValue,
      newValue,
      url,
      timestamp: context.timestamp,
    });
  }

  return rows;
};

/**
 * Formats a result value for CSV output
 */
const formatResultValue = (
  value: ResultValue,
  flattenObjects = false
): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (flattenObjects && typeof value === "object" && !Array.isArray(value)) {
    return objectToString(value);
  }

  return formatValue(value);
};
