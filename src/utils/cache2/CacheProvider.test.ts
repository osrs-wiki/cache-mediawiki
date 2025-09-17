import { FileProvider } from "./Cache";
import { DiskCacheProvider } from "./DiskCache";
import { FlatCacheProvider } from "./FlatCache";
import { XTEAKeyManager } from "./xtea/xtea";

import { loadXTEAKeysForCache } from "@/utils/openrs2";

// Mock openrs2 module
jest.mock("@/utils/openrs2", () => ({
  loadXTEAKeysForCache: jest.fn(),
}));

describe("Cache Provider XTEA Integration", () => {
  let mockFileProvider: FileProvider;
  let mockXTEAManager: XTEAKeyManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFileProvider = {
      getFile: jest.fn().mockResolvedValue(new Uint8Array()),
    };

    mockXTEAManager = new XTEAKeyManager();
    jest.spyOn(mockXTEAManager, "loadKeys").mockReturnValue(5);

    (loadXTEAKeysForCache as jest.Mock).mockResolvedValue(mockXTEAManager);

    // Mock console methods
    jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("DiskCacheProvider", () => {
    it("should initialize XTEA keys when accessing Maps index", async () => {
      const cacheVersion = "2025-09-03-rev232";
      const provider = new DiskCacheProvider(mockFileProvider, cacheVersion);

      // Mock file provider to return dummy index data
      (mockFileProvider.getFile as jest.Mock).mockResolvedValue(
        new Uint8Array([0, 0, 0, 1]) // Minimal valid cache data
      );

      try {
        await provider.getIndex(5); // IndexType.Maps
        // After accessing Maps index, XTEA loading should be initiated
        expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
      } catch (error) {
        // Expected to fail due to mock data, but XTEA loading should still be attempted
        expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
      }
    });

    it("should return empty XTEA manager when no cache version is provided", async () => {
      const provider = new DiskCacheProvider(mockFileProvider);

      const keys = await provider.getKeys();

      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
    });

    it("should handle XTEA loading errors gracefully", async () => {
      const cacheVersion = "2025-09-03-rev232";
      (loadXTEAKeysForCache as jest.Mock).mockRejectedValue(
        new Error("API Error")
      );

      const provider = new DiskCacheProvider(mockFileProvider, cacheVersion);

      // Mock file provider to return dummy index data
      (mockFileProvider.getFile as jest.Mock).mockResolvedValue(
        new Uint8Array([0, 0, 0, 1])
      );

      try {
        await provider.getIndex(5); // IndexType.Maps
        // Should handle error gracefully
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to load XTEA keys for cache 2025-09-03-rev232: API Error"
        );
      } catch (error) {
        // Expected to fail due to mock data, but error handling should still work
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to load XTEA keys for cache 2025-09-03-rev232: API Error"
        );
      }
    });
  });

  describe("FlatCacheProvider", () => {
    it("should initialize XTEA keys when accessing Maps index", async () => {
      const cacheVersion = "2025-09-03-rev232";
      const provider = new FlatCacheProvider(mockFileProvider, cacheVersion);

      // Mock file provider to return dummy index data
      (mockFileProvider.getFile as jest.Mock).mockResolvedValue(
        new Uint8Array([0, 0, 0, 1]) // Minimal valid cache data
      );

      try {
        await provider.getIndex(5); // IndexType.Maps
        // After accessing Maps index, XTEA loading should be initiated
        expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
      } catch (error) {
        // Expected to fail due to mock data, but XTEA loading should still be attempted
        expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
      }
    });

    it("should return empty XTEA manager when no cache version is provided", async () => {
      const provider = new FlatCacheProvider(mockFileProvider);

      const keys = await provider.getKeys();

      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
    });

    it("should handle XTEA loading errors gracefully", async () => {
      const cacheVersion = "2025-09-03-rev232";
      (loadXTEAKeysForCache as jest.Mock).mockRejectedValue(
        new Error("Network timeout")
      );

      const provider = new FlatCacheProvider(mockFileProvider, cacheVersion);

      // Mock file provider to return dummy index data
      (mockFileProvider.getFile as jest.Mock).mockResolvedValue(
        new Uint8Array([0, 0, 0, 1])
      );

      try {
        await provider.getIndex(5); // IndexType.Maps
        // Should handle error gracefully
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to load XTEA keys for cache 2025-09-03-rev232: Network timeout"
        );
      } catch (error) {
        // Expected to fail due to mock data, but error handling should still work
        expect(console.warn).toHaveBeenCalledWith(
          "Failed to load XTEA keys for cache 2025-09-03-rev232: Network timeout"
        );
      }
    });
  });
});
