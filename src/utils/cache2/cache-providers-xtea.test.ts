import { FileProvider } from "./Cache";
import { DiskCacheProvider } from "./DiskCache";
import { FlatCacheProvider } from "./FlatCache";
import { XTEAKeyManager } from "./xtea";

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
    it("should start loading XTEA keys in constructor when cache version is provided", () => {
      const cacheVersion = "2025-09-03-rev232";
      
      new DiskCacheProvider(mockFileProvider, cacheVersion);

      // XTEA loading should be initiated immediately
      expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
    });

    it("should not start loading XTEA keys when no cache version is provided", () => {
      new DiskCacheProvider(mockFileProvider);

      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
    });

    it("should return cached XTEA manager when getKeys() is called after loading completes", async () => {
      const cacheVersion = "2025-09-03-rev232";
      const provider = new DiskCacheProvider(mockFileProvider, cacheVersion);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const keys = await provider.getKeys();
      expect(keys).toBe(mockXTEAManager);
    });

    it("should return empty XTEA manager when no cache version is provided", async () => {
      const provider = new DiskCacheProvider(mockFileProvider);

      const keys = await provider.getKeys();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
    });

    it("should handle XTEA loading errors gracefully", async () => {
      (loadXTEAKeysForCache as jest.Mock).mockRejectedValue(new Error("API Error"));
      
      const cacheVersion = "2025-09-03-rev232";
      const provider = new DiskCacheProvider(mockFileProvider, cacheVersion);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const keys = await provider.getKeys();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to load XTEA keys for cache 2025-09-03-rev232: API Error"
      );
    });
  });

  describe("FlatCacheProvider", () => {
    it("should start loading XTEA keys in constructor when cache version is provided", () => {
      const cacheVersion = "2025-09-03-rev232";
      
      new FlatCacheProvider(mockFileProvider, cacheVersion);

      // XTEA loading should be initiated immediately
      expect(loadXTEAKeysForCache).toHaveBeenCalledWith(cacheVersion);
    });

    it("should not start loading XTEA keys when no cache version is provided", () => {
      new FlatCacheProvider(mockFileProvider);

      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
    });

    it("should return cached XTEA manager when getKeys() is called after loading completes", async () => {
      const cacheVersion = "2025-09-03-rev232";
      const provider = new FlatCacheProvider(mockFileProvider, cacheVersion);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const keys = await provider.getKeys();
      expect(keys).toBe(mockXTEAManager);
    });

    it("should return empty XTEA manager when no cache version is provided", async () => {
      const provider = new FlatCacheProvider(mockFileProvider);

      const keys = await provider.getKeys();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
      expect(loadXTEAKeysForCache).not.toHaveBeenCalled();
    });

    it("should handle XTEA loading errors gracefully", async () => {
      (loadXTEAKeysForCache as jest.Mock).mockRejectedValue(new Error("Network timeout"));
      
      const cacheVersion = "2025-09-03-rev232";
      const provider = new FlatCacheProvider(mockFileProvider, cacheVersion);

      // Wait for initialization to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      const keys = await provider.getKeys();
      expect(keys).toBeInstanceOf(XTEAKeyManager);
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to load XTEA keys for cache 2025-09-03-rev232: Network timeout"
      );
    });
  });
});