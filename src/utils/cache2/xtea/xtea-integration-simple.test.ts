import { XTEAKeyManager } from "./xtea";
import { ArchiveData, FileProvider } from "../Cache";
import { DiskCacheProvider } from "../DiskCache";
import { FlatCacheProvider } from "../FlatCache";
import { RegionMapper } from "../loaders/RegionMapper";
import { IndexType } from "../types";

// Mock index interface for testing
interface MockIndex {
  getArchive?: (archive: number) => ArchiveData | undefined;
  archives?: Map<number, ArchiveData>;
}

// Mock openrs2 module
jest.mock("@/utils/openrs2", () => ({
  loadXTEAKeysForCache: jest.fn(),
}));

// Mock RegionMapper
jest.mock("../loaders/RegionMapper", () => ({
  RegionMapper: {
    getRegionFromArchiveId: jest.fn(),
  },
}));

import { loadXTEAKeysForCache } from "@/utils/openrs2";

describe("XTEA Integration", () => {
  let mockFileProvider: FileProvider;
  let mockXTEAManager: XTEAKeyManager;

  beforeEach(() => {
    jest.clearAllMocks();

    mockFileProvider = {
      getFile: jest.fn().mockResolvedValue(new Uint8Array()),
    };

    mockXTEAManager = new XTEAKeyManager();

    // Mock RegionMapper to return RegionInfo object for archive ID 12345
    (RegionMapper.getRegionFromArchiveId as jest.Mock).mockReturnValue({
      regionX: 123,
      regionY: 45,
      regionId: 12345,
      type: "map" as const,
      archiveName: "m123_45",
    });

    // Add test keys using the public API
    const testKeys = [
      {
        mapsquare: 12345,
        key: [1, 2, 3, 4] as [number, number, number, number],
      },
    ];
    mockXTEAManager.loadKeys(testKeys);

    (loadXTEAKeysForCache as jest.Mock).mockResolvedValue(mockXTEAManager);

    // Mock console methods
    jest.spyOn(console, "warn").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("FlatCacheProvider", () => {
    it("should set XTEA key for Maps index archives with known region", async () => {
      const provider = new FlatCacheProvider(
        mockFileProvider,
        "2025-09-03-rev232"
      );

      // Mock getIndex to return a mock index with an archive
      const mockArchiveData = new ArchiveData(IndexType.Maps, 12345);
      const mockIndex: MockIndex = {
        getArchive: jest.fn().mockReturnValue(mockArchiveData),
      };

      jest
        .spyOn(provider, "getIndex")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .mockResolvedValue(mockIndex as any);

      // Mock getKeys to return our mock XTEA manager
      jest.spyOn(provider, "getKeys").mockResolvedValue(mockXTEAManager);

      // Mock tryDecrypt to succeed and set the key
      jest.spyOn(mockXTEAManager, "tryDecrypt").mockImplementation((ad) => {
        ad.key = [1, 2, 3, 4];
        return undefined; // Success
      });

      const result = await provider.getArchive(IndexType.Maps, 12345);

      expect(result).toBe(mockArchiveData);
      expect(result?.key).toEqual([1, 2, 3, 4]);
    });

    it("should not set XTEA key for non-Maps index archives", async () => {
      const provider = new FlatCacheProvider(
        mockFileProvider,
        "2025-09-03-rev232"
      );

      const mockArchiveData = new ArchiveData(IndexType.Configs, 12345);
      const mockIndex: MockIndex = {
        getArchive: jest.fn().mockReturnValue(mockArchiveData),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(provider, "getIndex").mockResolvedValue(mockIndex as any);

      const result = await provider.getArchive(IndexType.Configs, 12345);

      expect(result).toBe(mockArchiveData);
      expect(result?.key).toBeUndefined();
    });
  });

  describe("DiskCacheProvider", () => {
    it("should set XTEA key for Maps index archives with known region", async () => {
      const provider = new DiskCacheProvider(
        mockFileProvider,
        "2025-09-03-rev232"
      );

      // Mock the complex DiskCache logic
      const mockArchiveData = new ArchiveData(IndexType.Maps, 12345);
      mockArchiveData.compressedData = new Uint8Array([1, 2, 3, 4]); // Already has data

      const mockIndex: MockIndex = {
        archives: new Map([[12345, mockArchiveData]]),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(provider, "getIndex").mockResolvedValue(mockIndex as any);

      // Mock getKeys to return our mock XTEA manager
      jest.spyOn(provider, "getKeys").mockResolvedValue(mockXTEAManager);

      // Mock tryDecrypt to succeed and set the key
      jest.spyOn(mockXTEAManager, "tryDecrypt").mockImplementation((ad) => {
        ad.key = [1, 2, 3, 4];
        return undefined; // Success
      });

      const result = await provider.getArchive(IndexType.Maps, 12345);

      expect(result).toBe(mockArchiveData);
      expect(result?.key).toEqual([1, 2, 3, 4]);
    });

    it("should not set XTEA key for non-Maps index archives", async () => {
      const provider = new DiskCacheProvider(
        mockFileProvider,
        "2025-09-03-rev232"
      );

      const mockArchiveData = new ArchiveData(IndexType.Configs, 12345);
      mockArchiveData.compressedData = new Uint8Array([1, 2, 3, 4]);

      const mockIndex: MockIndex = {
        archives: new Map([[12345, mockArchiveData]]),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      jest.spyOn(provider, "getIndex").mockResolvedValue(mockIndex as any);

      const result = await provider.getArchive(IndexType.Configs, 12345);

      expect(result).toBe(mockArchiveData);
      expect(result?.key).toBeUndefined();
    });
  });
});
