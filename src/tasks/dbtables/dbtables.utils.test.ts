import {
  sanitizeFilename,
  formatCellValue,
  extractColumnHeaders,
} from "./dbtables.utils";

import { DBRow } from "@/utils/cache2/loaders/DBRow";
import { DBRowID } from "@/utils/cache2/types";

describe("dbtables.utils", () => {
  describe("sanitizeFilename", () => {
    it("should replace special characters with underscores", () => {
      expect(sanitizeFilename("Table Name!")).toBe("Table_Name");
      expect(sanitizeFilename("Music/Tracks")).toBe("Music_Tracks");
      expect(sanitizeFilename("Items & Objects")).toBe("Items_Objects");
    });

    it("should collapse multiple underscores", () => {
      expect(sanitizeFilename("Table___Name")).toBe("Table_Name");
    });

    it("should remove leading and trailing underscores", () => {
      expect(sanitizeFilename("_Table_")).toBe("Table");
      expect(sanitizeFilename("__Table__")).toBe("Table");
    });

    it("should handle alphanumeric and existing underscores", () => {
      expect(sanitizeFilename("Table_123_ABC")).toBe("Table_123_ABC");
    });
  });

  describe("formatCellValue", () => {
    it("should return undefined for null/undefined values", () => {
      expect(formatCellValue(undefined)).toBeUndefined();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(formatCellValue(null as any)).toBeUndefined();
    });

    it("should convert bigint to string", () => {
      expect(formatCellValue(BigInt(123))).toBe("123");
      expect(formatCellValue(BigInt(999999999999))).toBe("999999999999");
    });

    it("should pass through numbers unchanged", () => {
      expect(formatCellValue(42)).toBe(42);
      expect(formatCellValue(0)).toBe(0);
      expect(formatCellValue(-123)).toBe(-123);
    });

    it("should pass through strings unchanged", () => {
      expect(formatCellValue("test")).toBe("test");
      expect(formatCellValue("")).toBe("");
    });
  });

  describe("extractColumnHeaders", () => {
    it("should extract headers for defined columns", () => {
      const mockRow = {
        id: 1 as DBRowID,
        table: 44,
        values: [["value1"], ["value2"], undefined, ["value4"]],
        types: [],
      } as DBRow;

      const columnNames = new Map([
        [0, "Column_A"],
        [1, "Column_B"],
        [3, "Column_D"],
      ]);

      const headers = extractColumnHeaders(mockRow, columnNames);

      // Now includes ALL columns up to max index, even undefined ones
      expect(headers).toEqual(["Column_A", "Column_B", "Column_2", "Column_D"]);
    });

    it("should use fallback names for unnamed columns", () => {
      const mockRow = {
        id: 1 as DBRowID,
        table: 44,
        values: [["value1"], ["value2"]],
        types: [],
      } as DBRow;

      const columnNames = new Map([[0, "Column_A"]]);

      const headers = extractColumnHeaders(mockRow, columnNames);

      expect(headers).toEqual(["Column_A", "Column_1"]);
    });

    it("should handle empty values array", () => {
      const mockRow = {
        id: 1 as DBRowID,
        table: 44,
        values: [],
        types: [],
      } as DBRow;

      const columnNames = new Map();

      const headers = extractColumnHeaders(mockRow, columnNames);

      expect(headers).toEqual([]);
    });

    it("should include all columns even when first row has empty values", () => {
      const mockRow = {
        id: 1 as DBRowID,
        table: 164,
        values: [
          ["value0"], // Column 0 has value
          [], // Column 1 empty
          [], // Column 2 empty
          [], // Column 3 empty
          ["value4"], // Column 4 has value
        ],
        types: [],
      } as DBRow;

      const columnNames = new Map([
        [0, "boat_hp_max"],
        [1, "boat_speed"],
        [2, "boat_turning"],
        [3, "boat_cargo"],
        [4, "boat_defense"],
      ]);

      const headers = extractColumnHeaders(mockRow, columnNames);

      // Should include ALL defined columns, not just ones with values
      expect(headers).toEqual([
        "boat_hp_max",
        "boat_speed",
        "boat_turning",
        "boat_cargo",
        "boat_defense",
      ]);
    });
  });
});
