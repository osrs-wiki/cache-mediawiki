export type CSVRow = Record<string, string | number | boolean | undefined>;

export type CSVData = CSVRow[];

export type CSVExportOptions = {
  filename: string;
  headers: string[];
  delimiter?: string;
  includeHeaders?: boolean;
  outputDir?: string;
};

export type CSVField = {
  key: string;
  label: string;
  formatter?: (value: unknown) => string;
  required?: boolean;
};

export type CSVConfiguration = {
  fields: CSVField[];
  defaultValues?: Record<string, unknown>;
  sortBy?: string;
  filterFn?: (row: CSVRow) => boolean;
};
