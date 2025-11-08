import { Difference } from "../differences.types";

import { CSVRow } from "@/utils/csv";

export type DifferencesCSVRow = CSVRow & {
  indexId: number;
  indexName: string;
  archiveId: number;
  fileId: number;
  changeType: Difference;
  entityId?: string | number;
  entityName?: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  url?: string;
  timestamp?: string;
};

export type CSVExportConfig = {
  outputDir: string;
  version: string;
  includeURLs?: boolean;
  flattenObjects?: boolean;
  includeTimestamp?: boolean;
};

export type EntityFormatter = {
  getEntityId?: (
    result: Record<string, unknown>
  ) => string | number | undefined;
  getEntityName?: (result: Record<string, unknown>) => string | undefined;
  getEntityUrl?: (
    entityId: string | number,
    fileId: number
  ) => string | undefined;
  shouldIncludeField?: (fieldName: string) => boolean;
};

export type CSVOutputFiles = {
  summary: string;
  detailed: string;
  byIndex: Record<number, string>;
  byChangeType: Record<Difference, string>;
};
