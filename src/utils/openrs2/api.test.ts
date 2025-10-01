import { fetchCacheList, fetchCacheKeys, OpenRSAPICache } from "./api";

// Mock fetch globally
global.fetch = jest.fn();

describe("OpenRS2 API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear the cache before each test
    OpenRSAPICache.cacheList = [];
    OpenRSAPICache.cacheKeys = {};
  });

  describe("fetchCacheList", () => {
    it("should fetch cache list successfully", async () => {
      const mockResponse = [
        {
          id: 1,
          scope: "runescape",
          game: "oldschool",
          environment: "live",
          timestamp: "2025-09-03T10:00:00Z",
        },
      ];
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await fetchCacheList();
      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        "https://archive.openrs2.org/caches.json"
      );
    });

    it("should handle API errors", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Internal Server Error",
      });

      await expect(fetchCacheList()).rejects.toThrow(
        "Failed to fetch cache list: Internal Server Error"
      );
    });

    it("should handle network errors", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(fetchCacheList()).rejects.toThrow("Network error");
    });
  });

  describe("fetchCacheKeys", () => {
    it("should fetch cache keys successfully", async () => {
      const mockKeys = [
        {
          archive: 5,
          group: 1,
          name_hash: -1153413389,
          name: "l42_42",
          mapsquare: 10794,
          key: [-1303394492, 1234604739, -1845593033, -1096028287],
        },
      ];
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockKeys),
      });

      const result = await fetchCacheKeys(1234);
      expect(result).toEqual(mockKeys);
      expect(fetch).toHaveBeenCalledWith(
        "https://archive.openrs2.org/caches/runescape/1234/keys.json"
      );
    });

    it("should handle API errors for cache keys", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: false,
        statusText: "Not Found",
      });

      await expect(fetchCacheKeys(999)).rejects.toThrow(
        "Failed to fetch keys for cache 999: Not Found"
      );
    });

    it("should handle network errors for cache keys", async () => {
      (fetch as jest.Mock).mockRejectedValue(new Error("Timeout"));

      await expect(fetchCacheKeys(1234)).rejects.toThrow("Timeout");
    });
  });
});
