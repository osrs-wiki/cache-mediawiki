import { convertDifferencesToCSV } from "./differences-csv.transformer";
import { DifferencesCSVRow } from "./differences-csv.types";
import { CacheDifferences } from "../differences.types";

describe("convertDifferencesToCSV", () => {
  const mockDifferences: CacheDifferences = {
    2: {
      1: {
        100: {
          added: {
            id: 1234,
            name: "Test Item",
            examine: "A test item",
          },
        },
        101: {
          removed: {
            id: 5678,
            name: "Removed Item",
            examine: "A removed item",
          },
        },
        102: {
          changed: {
            name: {
              oldValue: "Old Name",
              newValue: "New Name",
            },
            examine: {
              oldValue: "Old description",
              newValue: "New description",
            },
          },
        },
      },
    },
  };

  const config = {
    outputDir: "./test-output",
    version: "test-version",
    includeURLs: false,
    flattenObjects: true,
    includeTimestamp: true,
  };

  test("should convert added items to CSV rows", () => {
    const rows = convertDifferencesToCSV(mockDifferences, config);

    const addedRows = rows.filter(
      (row: DifferencesCSVRow) => row.changeType === "added"
    );
    expect(addedRows).toHaveLength(3); // id, name, examine fields

    addedRows.forEach((row: DifferencesCSVRow) => {
      expect(row.indexId).toBe(2);
      expect(row.archiveId).toBe(1);
      expect(row.fileId).toBe(100);
      expect(row.entityId).toBe(1234);
      expect(row.entityName).toBe("Test Item");
      expect(row.newValue).toBeDefined();
      expect(row.oldValue).toBeUndefined();
    });
  });

  test("should convert removed items to CSV rows", () => {
    const rows = convertDifferencesToCSV(mockDifferences, config);

    const removedRows = rows.filter(
      (row: DifferencesCSVRow) => row.changeType === "removed"
    );
    expect(removedRows).toHaveLength(3); // id, name, examine fields

    removedRows.forEach((row: DifferencesCSVRow) => {
      expect(row.indexId).toBe(2);
      expect(row.archiveId).toBe(1);
      expect(row.fileId).toBe(101);
      expect(row.entityId).toBe(5678);
      expect(row.entityName).toBe("Removed Item");
      expect(row.oldValue).toBeDefined();
      expect(row.newValue).toBeUndefined();
    });
  });

  test("should convert changed items to CSV rows", () => {
    const rows = convertDifferencesToCSV(mockDifferences, config);

    const changedRows = rows.filter(
      (row: DifferencesCSVRow) => row.changeType === "changed"
    );
    expect(changedRows).toHaveLength(2); // name, examine fields

    changedRows.forEach((row: DifferencesCSVRow) => {
      expect(row.indexId).toBe(2);
      expect(row.archiveId).toBe(1);
      expect(row.fileId).toBe(102);
      expect(row.oldValue).toBeDefined();
      expect(row.newValue).toBeDefined();
    });

    const nameChange = changedRows.find(
      (row: DifferencesCSVRow) => row.fieldName === "name"
    );
    expect(nameChange?.oldValue).toBe("Old Name");
    expect(nameChange?.newValue).toBe("New Name");
  });

  test("should include timestamp when requested", () => {
    const rows = convertDifferencesToCSV(mockDifferences, config);

    rows.forEach((row: DifferencesCSVRow) => {
      expect(row.timestamp).toBeDefined();
      expect(typeof row.timestamp).toBe("string");
    });
  });

  test("should exclude timestamp when not requested", () => {
    const configNoTimestamp = { ...config, includeTimestamp: false };
    const rows = convertDifferencesToCSV(mockDifferences, configNoTimestamp);

    rows.forEach((row: DifferencesCSVRow) => {
      expect(row.timestamp).toBeUndefined();
    });
  });
});
