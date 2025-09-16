import { parseCacheVersion, findCacheByVersion } from "./cache-matcher";
import { OpenRS2CacheEntry } from "./types";

describe("Cache Matcher", () => {
  describe("parseCacheVersion", () => {
    it("should parse standard cache version format", () => {
      const result = parseCacheVersion("2025-09-03-rev232");
      expect(result.date.toISOString()).toBe("2025-09-03T00:00:00.000Z");
      expect(result.revision).toBe(232);
    });

    it("should parse cache version without revision", () => {
      const result = parseCacheVersion("2025-09-03");
      expect(result.date.toISOString()).toBe("2025-09-03T00:00:00.000Z");
      expect(result.revision).toBeUndefined();
    });

    it("should handle single digit months and days", () => {
      const result = parseCacheVersion("2025-01-05-rev100");
      expect(result.date.toISOString()).toBe("2025-01-05T00:00:00.000Z");
      expect(result.revision).toBe(100);
    });

    it("should throw error for invalid date format", () => {
      expect(() => parseCacheVersion("invalid-format")).toThrow(
        "Invalid cache version format: invalid-format. Expected format: YYYY-MM-DD-revXXX"
      );
    });

    it("should throw error for malformed date", () => {
      expect(() => parseCacheVersion("2025-13-50-rev232")).toThrow(
        "Invalid cache version format: 2025-13-50-rev232. Expected format: YYYY-MM-DD-revXXX"
      );
    });

    it("should throw error for invalid revision format", () => {
      expect(() => parseCacheVersion("2025-09-03-revABC")).toThrow(
        "Invalid cache version format: 2025-09-03-revABC. Expected format: YYYY-MM-DD-revXXX"
      );
    });
  });

  describe("findCacheByVersion", () => {
    const mockCaches: OpenRS2CacheEntry[] = [
      {
        id: 1,
        scope: "runescape",
        game: "oldschool",
        environment: "live",
        language: "en",
        builds: [{ major: 231, minor: null }],
        timestamp: "2025-09-03T10:30:00.000Z",
        sources: ["Jagex"],
        valid_indexes: 23,
        indexes: 23,
        valid_groups: 113240,
        groups: 113240,
        valid_keys: 2328,
        keys: 2365,
        size: 137468705,
        blocks: 335533,
        disk_store_valid: true,
      },
      {
        id: 2,
        scope: "runescape",
        game: "oldschool",
        environment: "live",
        language: "en",
        builds: [{ major: 232, minor: null }],
        timestamp: "2025-09-04T15:45:00.000Z",
        sources: ["Jagex"],
        valid_indexes: 23,
        indexes: 23,
        valid_groups: 113250,
        groups: 113250,
        valid_keys: 2330,
        keys: 2367,
        size: 137500000,
        blocks: 335600,
        disk_store_valid: true,
      },
      {
        id: 3,
        scope: "runescape",
        game: "runescape", // RS3, not OSRS
        environment: "live",
        language: "en",
        builds: [{ major: 1000, minor: null }],
        timestamp: "2025-09-03T10:30:00.000Z",
        sources: ["Jagex"],
        valid_indexes: 30,
        indexes: 30,
        valid_groups: 200000,
        groups: 200000,
        valid_keys: 5000,
        keys: 5000,
        size: 500000000,
        blocks: 1000000,
        disk_store_valid: true,
      },
    ];

    it("should find cache by exact date match", () => {
      const result = findCacheByVersion("2025-09-03", mockCaches);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.timestamp).toBe("2025-09-03T10:30:00.000Z");
    });

    it("should find cache by date regardless of revision", () => {
      const result = findCacheByVersion("2025-09-03-rev999", mockCaches);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
    });

    it("should return undefined for non-existent date", () => {
      const result = findCacheByVersion("2025-12-25", mockCaches);
      expect(result).toBeUndefined();
    });

    it("should filter out non-OSRS caches", () => {
      const result = findCacheByVersion("2025-09-03", mockCaches);
      expect(result?.id).toBe(1); // Should not return cache with id=3 (RS3)
    });

    it("should filter to live environment only", () => {
      const betaCaches: OpenRS2CacheEntry[] = [
        {
          ...mockCaches[0],
          id: 999,
          environment: "beta",
        },
      ];

      const result = findCacheByVersion("2025-09-03", betaCaches);
      expect(result).toBeUndefined();
    });

    it("should handle empty cache list", () => {
      const result = findCacheByVersion("2025-09-03", []);
      expect(result).toBeUndefined();
    });

    it("should throw error for invalid version format", () => {
      expect(() => findCacheByVersion("invalid", mockCaches)).toThrow(
        "Invalid cache version format"
      );
    });
  });
});
