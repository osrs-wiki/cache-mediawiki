import { fetchCacheList, fetchCacheKeys } from "./api";
import { findCacheByVersion } from "./cache-matcher";
import { loadXTEAKeysForCache } from "./xtea-loader";

import { XTEAKeyManager } from "@/utils/cache2";

// Mock dependencies
jest.mock("./api");
jest.mock("./cache-matcher");
jest.mock("@/utils/cache2");

describe("XTEA Loader", () => {
  const mockCacheList = [
    {
      id: 1234,
      scope: "runescape",
      game: "oldschool",
      environment: "live",
      timestamp: "2025-09-03T10:00:00Z",
    },
  ];

  const mockKeys = [
    {
      archive: 5,
      group: 1,
      name_hash: -1153413389,
      name: "l42_42",
      mapsquare: 10794,
      key: [-1303394492, 1234604739, -1845593033, -1096028287],
    },
    {
      archive: 5,
      group: 2,
      name_hash: -1153413390,
      name: "l43_43",
      mapsquare: 11050,
      key: [-1303394493, 1234604740, -1845593034, -1096028288],
    },
  ];

  let mockXTEAManagerInstance: XTEAKeyManager;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock XTEAKeyManager instance
    mockXTEAManagerInstance = new XTEAKeyManager();
    jest.spyOn(mockXTEAManagerInstance, "loadKeys").mockReturnValue(2);

    // Mock XTEAKeyManager constructor
    (
      XTEAKeyManager as jest.MockedClass<typeof XTEAKeyManager>
    ).mockImplementation(() => mockXTEAManagerInstance);

    // Mock API functions
    (fetchCacheList as jest.Mock).mockResolvedValue(mockCacheList);
    (fetchCacheKeys as jest.Mock).mockResolvedValue(mockKeys);
    (findCacheByVersion as jest.Mock).mockReturnValue(mockCacheList[0]);

    // Mock console methods
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should load XTEA keys for cache version successfully", async () => {
    const manager = await loadXTEAKeysForCache("2025-09-03-rev232");

    expect(fetchCacheList).toHaveBeenCalledTimes(1);
    expect(findCacheByVersion).toHaveBeenCalledWith(
      "2025-09-03-rev232",
      mockCacheList
    );
    expect(fetchCacheKeys).toHaveBeenCalledWith(1234);
    expect(mockXTEAManagerInstance.loadKeys).toHaveBeenCalledWith(mockKeys);
    expect(manager).toBe(mockXTEAManagerInstance);
  });

  it("should log progress during loading", async () => {
    await loadXTEAKeysForCache("2025-09-03-rev232");

    expect(console.log).toHaveBeenCalledWith(
      "Loading XTEA keys for cache version: 2025-09-03-rev232"
    );
    expect(console.log).toHaveBeenCalledWith(
      "Loaded 2 XTEA keys for cache 2025-09-03-rev232 (OpenRS2 ID: 1234)"
    );
  });

  it("should throw error when cache entry not found", async () => {
    (findCacheByVersion as jest.Mock).mockReturnValue(undefined);

    await expect(loadXTEAKeysForCache("2025-12-25-rev999")).rejects.toThrow(
      "Could not find cache entry for version: 2025-12-25-rev999"
    );

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load XTEA keys for cache 2025-12-25-rev999: Could not find cache entry for version: 2025-12-25-rev999"
    );
  });

  it("should handle API errors when fetching cache list", async () => {
    (fetchCacheList as jest.Mock).mockRejectedValue(new Error("API Error"));

    await expect(loadXTEAKeysForCache("2025-09-03-rev232")).rejects.toThrow(
      "API Error"
    );

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load XTEA keys for cache 2025-09-03-rev232: API Error"
    );
  });

  it("should handle API errors when fetching cache keys", async () => {
    (fetchCacheKeys as jest.Mock).mockRejectedValue(
      new Error("Keys API Error")
    );

    await expect(loadXTEAKeysForCache("2025-09-03-rev232")).rejects.toThrow(
      "Keys API Error"
    );

    expect(console.error).toHaveBeenCalledWith(
      "Failed to load XTEA keys for cache 2025-09-03-rev232: Keys API Error"
    );
  });

  it("should handle invalid cache version format", async () => {
    (findCacheByVersion as jest.Mock).mockImplementation(() => {
      throw new Error("Invalid cache version format");
    });

    await expect(loadXTEAKeysForCache("invalid-format")).rejects.toThrow(
      "Invalid cache version format"
    );
  });

  it("should work with cache version without revision", async () => {
    await loadXTEAKeysForCache("2025-09-03");

    expect(findCacheByVersion).toHaveBeenCalledWith(
      "2025-09-03",
      mockCacheList
    );
    expect(fetchCacheKeys).toHaveBeenCalledWith(1234);
    expect(mockXTEAManagerInstance.loadKeys).toHaveBeenCalledWith(mockKeys);
  });

  it("should handle empty keys response", async () => {
    (fetchCacheKeys as jest.Mock).mockResolvedValue([]);
    jest.spyOn(mockXTEAManagerInstance, "loadKeys").mockReturnValue(0);

    const manager = await loadXTEAKeysForCache("2025-09-03-rev232");

    expect(manager).toBe(mockXTEAManagerInstance);
    expect(console.log).toHaveBeenCalledWith(
      "Loaded 0 XTEA keys for cache 2025-09-03-rev232 (OpenRS2 ID: 1234)"
    );
  });
});
