import {
  sanitizeFilename,
  formatCellValue,
  extractColumnHeaders,
  dbRowToCatalogRow,
  dbTableToCatalogColumns,
  groupDBRowsByTable,
} from "./dbtables.utils";

import { DBRow, DBTable } from "@/utils/cache2/loaders/DBRow";
import { DBRowID, DBTableID, ScriptVarID } from "@/utils/cache2/types";

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
      expect(headers).toEqual([
        "0 - Column_A",
        "1 - Column_B",
        "2 - Column_2",
        "3 - Column_D",
      ]);
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

      expect(headers).toEqual(["0 - Column_A", "1 - Column_1"]);
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
        "0 - boat_hp_max",
        "1 - boat_speed",
        "2 - boat_turning",
        "3 - boat_cargo",
        "4 - boat_defense",
      ]);
    });

    it("should include columns only present in later rows", () => {
      const rows = [
        {
          id: 1 as DBRowID,
          table: 44,
          values: [["first"]],
          types: [],
        },
        {
          id: 2 as DBRowID,
          table: 44,
          values: [["second"], [], ["third"]],
          types: [],
        },
      ] as DBRow[];

      expect(extractColumnHeaders(rows, new Map([[0, "name"]]))).toEqual([
        "0 - name",
        "1 - Column_1",
        "2 - Column_2",
      ]);
    });
  });

  describe("catalog helpers", () => {
    it("groups and sorts rows by table", () => {
      const rows = [
        { id: 9 as DBRowID, table: 2 as DBTableID },
        { id: 4 as DBRowID, table: 1 as DBTableID },
        { id: 2 as DBRowID, table: 2 as DBTableID },
      ].map((row) => row as DBRow);

      const grouped = groupDBRowsByTable(rows);

      expect(
        Array.from(grouped.get(1 as DBTableID) ?? []).map((row) => row.id)
      ).toEqual([4]);
      expect(
        Array.from(grouped.get(2 as DBTableID) ?? []).map((row) => row.id)
      ).toEqual([2, 9]);
    });

    it("preserves table types, defaults, and raw tuple boundaries", () => {
      const table = new DBTable(0 as DBTableID);
      table.types = [[36 as ScriptVarID], [22 as ScriptVarID]];
      table.defaultValues = [[], [0]];
      const rows = [
        {
          id: 5 as DBRowID,
          table: 0,
          values: [["quest"], [123]],
          types: table.types,
        },
      ] as DBRow[];

      expect(
        dbTableToCatalogColumns(
          table,
          new Map([
            [0, "name"],
            [1, "coordinate"],
          ]),
          rows
        )
      ).toEqual([
        {
          index: 0,
          name: "name",
          types: [
            {
              id: 36,
              name: "string",
              jagexName: "string",
              typeName: undefined,
              baseType: "string",
            },
          ],
          defaultValues: [],
        },
        {
          index: 1,
          name: "coordinate",
          types: [
            {
              id: 22,
              name: "coord",
              jagexName: "coordgrid",
              typeName: "WorldPoint",
              baseType: "int",
            },
          ],
          defaultValues: [0],
        },
      ]);
    });

    it("retains raw and effective values, including bigint serialization", () => {
      const table = new DBTable(44 as DBTableID);
      table.types = [[], [11 as ScriptVarID]];
      table.defaultValues = [["fallback"], [123]];
      const row = {
        id: 8 as DBRowID,
        table: 44,
        values: [undefined, [999999999999999999n]],
        types: [undefined, [11 as ScriptVarID]],
      } as DBRow;

      expect(dbRowToCatalogRow(row, table, "track")).toEqual({
        id: 8,
        name: "track",
        values: [null, ["999999999999999999"]],
        effectiveValues: [["fallback"], ["999999999999999999"]],
        typeIds: [null, [11]],
      });
    });
  });
});
