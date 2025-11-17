export type MediaWikiCSVExportOptions = {
  outputDir: string;
  baseFilename: string;
  extractTables?: boolean;
  extractLists?: boolean;
  includeTableCaptions?: boolean;
  includeTableClasses?: boolean;
};

export type ExtractedMediaWikiTable = {
  caption?: string;
  class?: string;
  headers: string[];
  rows: string[][];
  tableIndex: number;
  source: "header-row" | "header-cells" | "mixed";
};

export type MediaWikiCSVFiles = {
  tables: string[];
  combined?: string;
};

export type TableExtractionResult = {
  tables: ExtractedMediaWikiTable[];
  totalTables: number;
};
