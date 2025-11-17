import {
  MediaWikiBuilder,
  MediaWikiTable,
  MediaWikiContent,
} from "@osrs-wiki/mediawiki-builder";

import {
  ExtractedMediaWikiTable,
  TableExtractionResult,
} from "./mediawiki-csv.types";

/**
 * Extracts all tables from MediaWikiBuilder content
 */
export const extractTablesFromBuilder = (
  builder: MediaWikiBuilder
): TableExtractionResult => {
  const tables: ExtractedMediaWikiTable[] = [];
  let tableIndex = 0;

  // Recursively traverse content to find tables
  const traverseContent = (content: MediaWikiContent[]): void => {
    for (const item of content) {
      if (item instanceof MediaWikiTable) {
        const extractedTable = extractTableData(item, tableIndex++);
        tables.push(extractedTable);
      }

      // Check for nested content (children)
      if (item.children) {
        const childrenArray = Array.isArray(item.children)
          ? item.children
          : [item.children];

        const nestedContent = childrenArray.filter(
          (child): child is MediaWikiContent => typeof child !== "string"
        );

        if (nestedContent.length > 0) {
          traverseContent(nestedContent);
        }
      }
    }
  };

  traverseContent(builder.content);

  return {
    tables,
    totalTables: tables.length,
  };
};

/**
 * Extracts data from a single MediaWikiTable
 */
const extractTableData = (
  table: MediaWikiTable,
  tableIndex: number
): ExtractedMediaWikiTable => {
  const headers: string[] = [];
  const rows: string[][] = [];
  let tableName = "";

  // Extract table class from options
  const tableClass = table.options?.class;

  // Process rows to identify structure
  let headerSource: "header-row" | "header-cells" | "mixed" = "header-cells";
  let headerRowFound = false;

  for (let rowIndex = 0; rowIndex < table.rows.length; rowIndex++) {
    const row = table.rows[rowIndex];

    // Check if this is a title row (single cell with colspan covering full table)
    if (
      row.cells.length === 1 &&
      row.cells[0].options?.colspan &&
      row.cells[0].options.colspan > 1
    ) {
      // This is likely the table title/caption - extract it but don't process as data
      tableName = extractCellText(row.cells[0].content);
      continue;
    }

    // Check if this row contains header cells
    const hasRowHeader = row.header === true;
    const hasHeaderCells = row.cells.some((cell) => {
      const cellOptions = cell.options as
        | { header?: boolean; colspan?: number; [key: string]: unknown }
        | undefined;
      return cellOptions?.header === true;
    });
    const isHeaderRow = hasRowHeader || hasHeaderCells;

    if (isHeaderRow && !headerRowFound) {
      // This is the header row - extract column headers
      headerSource = hasRowHeader ? "header-row" : "header-cells";
      headerRowFound = true;

      for (const cell of row.cells) {
        const cellText = extractCellText(cell.content);
        headers.push(cellText);
      }
    } else if (headerRowFound) {
      // This is a data row - extract cell values
      const cellValues: string[] = [];
      for (const cell of row.cells) {
        const cellText = extractCellText(cell.content);
        cellValues.push(cellText);
      }

      if (cellValues.length > 0) {
        rows.push(cellValues);
      }
    } else if (!headerRowFound) {
      // If we haven't found headers yet, treat this as a data row and generate headers later
      const cellValues: string[] = [];
      for (const cell of row.cells) {
        const cellText = extractCellText(cell.content);
        cellValues.push(cellText);
      }

      if (cellValues.length > 0) {
        rows.push(cellValues);
      }
    }
  }

  // If no explicit headers found, generate column headers based on data
  if (headers.length === 0 && rows.length > 0) {
    const maxColumns = Math.max(...rows.map((row) => row.length));
    for (let i = 0; i < maxColumns; i++) {
      headers.push(`Column ${i + 1}`);
    }
    headerSource = "header-cells";
  }

  return {
    caption: tableName || table.caption,
    class: tableClass,
    headers,
    rows,
    tableIndex,
    source: headerSource,
  };
};

/**
 * Extracts plain text from MediaWiki content array
 */
const extractCellText = (content: MediaWikiContent[]): string => {
  return content
    .map((item) => {
      // Get the built text representation
      const builtText = item.build();

      // Strip MediaWiki markup for CSV
      return stripMediaWikiMarkup(builtText);
    })
    .join("")
    .trim();
};

/**
 * Strips common MediaWiki markup to get plain text
 */
const stripMediaWikiMarkup = (text: string): string => {
  return (
    text
      // Remove bold markup
      .replace(/'''([^']+)'''/g, "$1")
      // Remove italic markup
      .replace(/''([^']+)''/g, "$1")
      // Remove link markup [[Page|Text]] -> Text
      .replace(/\[\[([^|\]]+)\|([^\]]+)\]\]/g, "$2")
      // Remove simple links [[Page]] -> Page
      .replace(/\[\[([^\]]+)\]\]/g, "$1")
      // Template handling strategy:
      // For {{Template|display text}}, extract display text (first parameter after pipe).
      // For {{Template}}, extract Template name.
      // For {{Template|param1|param2}}, extract first parameter.
      .replace(/\{\{([^\}|]+)\|([^\}|]+)[^}]*\}\}/g, "$2")
      .replace(/\{\{([^\}|]+)\}\}/g, "$1")
      // Remove HTML tags
      .replace(/<[^>]+>/g, "")
      // Clean up whitespace
      .replace(/\s+/g, " ")
      .trim()
  );
};

/**
 * Converts MediaWikiTable to CSV-compatible data structure
 */
export const tableToCSVData = (table: ExtractedMediaWikiTable): string[][] => {
  const csvData: string[][] = [];

  // Add headers if available
  if (table.headers.length > 0) {
    csvData.push(table.headers);
  }

  // Add data rows
  csvData.push(...table.rows);

  return csvData;
};
