import {
  MediaWikiBuilder,
  MediaWikiTable,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import { promises as fs } from "fs";

import { extractTablesFromBuilder } from "./mediawiki-csv.extractor";
import { exportMediaWikiToCSV } from "./mediawiki-csv.writer";

// Mock fs module
jest.mock("fs", () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

const mockFs = fs as jest.Mocked<typeof fs>;

describe("MediaWiki CSV Export", () => {
  const createSampleTable = (): MediaWikiTable => {
    return new MediaWikiTable({
      caption: "Sample Table",
      options: { class: "wikitable sortable" },
      rows: [
        {
          header: true,
          cells: [
            { content: [new MediaWikiText("Name")] },
            { content: [new MediaWikiText("Level")] },
            { content: [new MediaWikiText("Description")] },
          ],
        },
        {
          cells: [
            { content: [new MediaWikiText("Item 1")] },
            { content: [new MediaWikiText("50")] },
            { content: [new MediaWikiText("A basic item")] },
          ],
        },
        {
          cells: [
            { content: [new MediaWikiText("Item 2")] },
            { content: [new MediaWikiText("75")] },
            { content: [new MediaWikiText("An advanced item")] },
          ],
        },
      ],
    });
  };

  const createComplexTable = (): MediaWikiTable => {
    return new MediaWikiTable({
      options: { class: "wikitable" },
      rows: [
        {
          cells: [
            {
              content: [new MediaWikiText("Header 1")],
            },
            { content: [new MediaWikiText("Data 1")] },
          ],
        },
        {
          cells: [
            {
              content: [new MediaWikiText("Header 2")],
            },
            { content: [new MediaWikiText("Data 2")] },
          ],
        },
      ],
    });
  };

  describe("extractTablesFromBuilder", () => {
    test("should extract simple table with header row", () => {
      const builder = new MediaWikiBuilder();
      const table = createSampleTable();
      builder.addContent(table);

      const result = extractTablesFromBuilder(builder);

      expect(result.totalTables).toBe(1);
      expect(result.tables).toHaveLength(1);

      const extractedTable = result.tables[0];
      expect(extractedTable.headers).toEqual(["Name", "Level", "Description"]);
      expect(extractedTable.rows).toHaveLength(2);
      expect(extractedTable.rows[0]).toEqual(["Item 1", "50", "A basic item"]);
      expect(extractedTable.rows[1]).toEqual([
        "Item 2",
        "75",
        "An advanced item",
      ]);
      expect(extractedTable.source).toBe("header-row");
      expect(extractedTable.caption).toBe("Sample Table");
      expect(extractedTable.class).toBe("wikitable sortable");
    });

    test("should extract table with individual cell headers", () => {
      const builder = new MediaWikiBuilder();
      const table = createComplexTable();
      builder.addContent(table);

      const result = extractTablesFromBuilder(builder);

      expect(result.totalTables).toBe(1);
      expect(result.tables).toHaveLength(1);

      const extractedTable = result.tables[0];
      // Since no explicit headers, it detects column headers from first row pattern
      expect(extractedTable.headers).toEqual(["Column 1", "Column 2"]);
      expect(extractedTable.rows).toHaveLength(2);
      expect(extractedTable.rows[0]).toEqual(["Header 1", "Data 1"]);
      expect(extractedTable.rows[1]).toEqual(["Header 2", "Data 2"]);
      expect(extractedTable.source).toBe("header-cells");
      expect(extractedTable.class).toBe("wikitable");
    });

    test("should return empty result for builder with no tables", () => {
      const builder = new MediaWikiBuilder();
      builder.addContent(new MediaWikiText("Just some text"));

      const result = extractTablesFromBuilder(builder);

      expect(result.totalTables).toBe(0);
      expect(result.tables).toHaveLength(0);
    });
  });

  describe("exportMediaWikiToCSV", () => {
    test("should export table to CSV file", async () => {
      const builder = new MediaWikiBuilder();
      const table = createSampleTable();
      builder.addContent(table);

      const outputDir = "./tmp/test-csv";

      // Setup mocks
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue();

      const files = await exportMediaWikiToCSV(builder, outputDir, {
        fileNamePrefix: "test-table",
        includeMetadata: true,
      });

      expect(files).toHaveLength(1);
      expect(files[0]).toMatch(/test-table\.csv$/); // Match the filename regardless of path separators

      expect(mockFs.mkdir).toHaveBeenCalledWith(outputDir, { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledTimes(1);

      const [filePath, content] = mockFs.writeFile.mock.calls[0];
      expect(filePath).toMatch(/test-table\.csv$/); // Match the filename regardless of path separators
      expect(typeof content).toBe("string");
      expect(content).toContain("# MediaWiki Table Export");
      expect(content).toContain("# Caption: Sample Table");
      expect(content).toContain("Name,Level,Description");
      expect(content).toContain("Item 1,50,A basic item");
    });

    test("should return empty array when no tables exist", async () => {
      const builder = new MediaWikiBuilder();
      builder.addContent(new MediaWikiText("No tables here"));

      const outputDir = "./tmp/test-csv";

      const files = await exportMediaWikiToCSV(builder, outputDir);
      expect(files).toHaveLength(0);
    });
  });
});
