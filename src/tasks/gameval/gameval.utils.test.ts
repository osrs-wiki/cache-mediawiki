import {
  filterGameValTypes,
  createNameToIdMap,
  findIdChanges,
  validateGameValData,
  buildCacheGameValMapping,
  getAvailableGameValTypes,
  compareGameValMappings,
  DEFAULT_EXCLUDED_TYPES,
} from "./gameval.utils";

import { GameVal, GameValID } from "@/utils/cache2";

// Mock data for testing
const createMockGameVal = (
  gameValID: GameValID,
  otherID: number,
  name: string
): GameVal => {
  const gameVal = new GameVal(gameValID, otherID);
  gameVal.name = name;
  return gameVal;
};

describe("GameVal Utils", () => {
  describe("filterGameValTypes", () => {
    const allTypes = [0, 1, 2, 10, 13, 14] as GameValID[];

    test("should exclude default types when no options provided", () => {
      const result = filterGameValTypes(allTypes);
      expect(result).toEqual([0, 1, 2]);
    });

    test("should respect includeTypes parameter", () => {
      const result = filterGameValTypes(allTypes, [0, 10] as GameValID[]);
      expect(result).toEqual([0, 10]);
    });

    test("should respect custom excludeTypes parameter", () => {
      const result = filterGameValTypes(allTypes, undefined, [
        1, 2,
      ] as GameValID[]);
      expect(result).toEqual([0, 10, 13, 14]);
    });

    test("should handle empty arrays", () => {
      expect(filterGameValTypes([])).toEqual([]);
      expect(filterGameValTypes(allTypes, [])).toEqual([]);
    });
  });

  describe("createNameToIdMap", () => {
    test("should create correct name to ID mapping", () => {
      const gameValMap = new Map([
        [123, createMockGameVal(0 as GameValID, 123, "Abyssal whip")],
        [456, createMockGameVal(0 as GameValID, 456, "Dragon scimitar")],
      ]);

      const result = createNameToIdMap(gameValMap);
      expect(result).toEqual({
        "Abyssal whip": 123,
        "Dragon scimitar": 456,
      });
    });

    test("should handle empty or undefined input", () => {
      expect(createNameToIdMap(undefined)).toEqual({});
      expect(createNameToIdMap(new Map())).toEqual({});
    });

    test("should skip entries with empty names", () => {
      const gameValMap = new Map([
        [123, createMockGameVal(0 as GameValID, 123, "Valid name")],
        [456, createMockGameVal(0 as GameValID, 456, "")],
        [789, createMockGameVal(0 as GameValID, 789, "   ")], // whitespace only
      ]);

      const result = createNameToIdMap(gameValMap);
      expect(result).toEqual({
        "Valid name": 123,
      });
    });
  });

  describe("findIdChanges", () => {
    test("should identify ID changes for matching names", () => {
      const oldMap = {
        "Abyssal whip": 123,
        "Dragon scimitar": 456,
        "Only in old": 789,
      };

      const newMap = {
        "Abyssal whip": 999, // Changed ID
        "Dragon scimitar": 456, // Same ID
        "Only in new": 111,
      };

      const result = findIdChanges(oldMap, newMap);
      expect(result).toEqual({
        "Abyssal whip": { oldId: 123, newId: 999 },
      });
    });

    test("should handle empty maps", () => {
      expect(findIdChanges({}, {})).toEqual({});
      expect(findIdChanges({ test: 1 }, {})).toEqual({});
      expect(findIdChanges({}, { test: 1 })).toEqual({});
    });

    test("should ignore entities with same IDs", () => {
      const oldMap = { "Same ID": 123 };
      const newMap = { "Same ID": 123 };

      expect(findIdChanges(oldMap, newMap)).toEqual({});
    });
  });

  describe("validateGameValData", () => {
    test("should validate good data", () => {
      const gameValMap = new Map([
        [123, createMockGameVal(0 as GameValID, 123, "Valid name 1")],
        [456, createMockGameVal(0 as GameValID, 456, "Valid name 2")],
      ]);

      const result = validateGameValData(gameValMap, 0 as GameValID);
      expect(result.isValid).toBe(true);
      expect(result.validEntries).toBe(2);
      expect(result.totalEntries).toBe(2);
      expect(result.warnings).toEqual([]);
    });

    test("should handle undefined input", () => {
      const result = validateGameValData(undefined, 0 as GameValID);
      expect(result.isValid).toBe(false);
      expect(result.validEntries).toBe(0);
      expect(result.totalEntries).toBe(0);
      expect(result.warnings).toContain("GameVal type 0 not found or empty");
    });

    test("should warn about invalid names", () => {
      const gameValMap = new Map([
        [123, createMockGameVal(0 as GameValID, 123, "Valid name")],
        [456, createMockGameVal(0 as GameValID, 456, "")],
        [789, createMockGameVal(0 as GameValID, 789, "   ")],
      ]);

      const result = validateGameValData(gameValMap, 0 as GameValID);
      expect(result.isValid).toBe(true); // Still valid because one entry is good
      expect(result.validEntries).toBe(1);
      expect(result.totalEntries).toBe(3);
      expect(result.warnings).toContain(
        "GameVal 0:456 has empty or invalid name"
      );
      expect(result.warnings).toContain(
        "GameVal 0:789 has empty or invalid name"
      );
    });

    test("should be invalid when no valid entries exist", () => {
      const gameValMap = new Map([
        [456, createMockGameVal(0 as GameValID, 456, "")],
      ]);

      const result = validateGameValData(gameValMap, 0 as GameValID);
      expect(result.isValid).toBe(false);
      expect(result.validEntries).toBe(0);
      expect(result.totalEntries).toBe(1);
      expect(result.warnings).toContain(
        "No valid GameVal entries found for type 0"
      );
    });
  });

  describe("buildCacheGameValMapping", () => {
    test("should build complete cache mapping", async () => {
      const gameValMap0 = new Map([
        [123, createMockGameVal(0 as GameValID, 123, "Item A")],
        [456, createMockGameVal(0 as GameValID, 456, "Item B")],
      ]);

      const gameValMap1 = new Map([
        [789, createMockGameVal(1 as GameValID, 789, "NPC A")],
      ]);

      // Mock GameVal.all to return our test data
      const originalAll = GameVal.all;
      GameVal.all = jest.fn().mockImplementation(async (cache, gameValType) => {
        if (gameValType === 0) {
          return gameValMap0;
        }
        if (gameValType === 1) {
          return gameValMap1;
        }
        return undefined;
      });

      const mockCache = {} as unknown as Parameters<
        typeof buildCacheGameValMapping
      >[0];
      const typesToProcess = [0, 1] as GameValID[];

      const result = await buildCacheGameValMapping(mockCache, typesToProcess);

      expect(result).toEqual({
        0: { "Item A": 123, "Item B": 456 },
        1: { "NPC A": 789 },
      });

      // Restore original method
      GameVal.all = originalAll;
    });

    test("should handle errors gracefully", async () => {
      const originalAll = GameVal.all;
      GameVal.all = jest.fn().mockRejectedValue(new Error("Cache error"));

      const mockCache = {} as unknown as Parameters<
        typeof buildCacheGameValMapping
      >[0];
      const typesToProcess = [0] as GameValID[];

      // Spy on console methods to suppress output during test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      const consoleWarnSpy = jest
        .spyOn(console, "warn")
        .mockImplementation(() => undefined);
      const consoleLogSpy = jest
        .spyOn(console, "log")
        .mockImplementation(() => undefined);

      const result = await buildCacheGameValMapping(mockCache, typesToProcess);

      expect(result).toEqual({});

      // Restore original methods
      GameVal.all = originalAll;
      consoleSpy.mockRestore();
      consoleWarnSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe("compareGameValMappings", () => {
    test("should identify changes between mappings", () => {
      const oldMapping = {
        0: { "Item A": 123, "Item B": 456, "Only in old": 789 },
        1: { "NPC A": 111 },
      };

      const newMapping = {
        0: { "Item A": 999, "Item B": 456, "Only in new": 222 }, // Item A changed ID
        1: { "NPC A": 111 }, // No changes
        2: { "New Type": 333 }, // New type
      };

      const result = compareGameValMappings(oldMapping, newMapping);

      expect(result).toEqual({
        0: { "Item A": { oldId: 123, newId: 999 } },
      });
    });

    test("should handle empty mappings", () => {
      expect(compareGameValMappings({}, {})).toEqual({});

      const mapping = { 0: { "Item A": 123 } };
      expect(compareGameValMappings(mapping, {})).toEqual({});
      expect(compareGameValMappings({}, mapping)).toEqual({});
    });

    test("should handle new types in new mapping", () => {
      const oldMapping = { 0: { "Item A": 123 } };
      const newMapping = {
        0: { "Item A": 123 },
        1: { "NPC A": 456 }, // New type
      };

      const result = compareGameValMappings(oldMapping, newMapping);
      expect(result).toEqual({}); // No ID changes, just new types
    });
  });

  describe("getAvailableGameValTypes", () => {
    test("should return available types from cache", async () => {
      const mockCache = {
        getArchives: jest.fn().mockResolvedValue([0, 1, 2, 10]),
      } as unknown as Parameters<typeof getAvailableGameValTypes>[0];

      const result = await getAvailableGameValTypes(mockCache);
      expect(result).toEqual([0, 1, 2, 10]);
    });

    test("should handle cache errors gracefully", async () => {
      const mockCache = {
        getArchives: jest.fn().mockRejectedValue(new Error("Cache error")),
      } as unknown as Parameters<typeof getAvailableGameValTypes>[0];

      // Spy on console.error to suppress error output during test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);

      const result = await getAvailableGameValTypes(mockCache);
      expect(result).toEqual([]);

      consoleSpy.mockRestore();
    });

    test("should handle undefined archives", async () => {
      const mockCache = {
        getArchives: jest.fn().mockResolvedValue(undefined),
      } as unknown as Parameters<typeof getAvailableGameValTypes>[0];

      const result = await getAvailableGameValTypes(mockCache);
      expect(result).toEqual([]);
    });
  });

  test("DEFAULT_EXCLUDED_TYPES should include advanced types", () => {
    expect(DEFAULT_EXCLUDED_TYPES).toEqual([10, 13, 14]);
  });
});
