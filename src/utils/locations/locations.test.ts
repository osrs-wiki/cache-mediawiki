import {
  clearLocationCache,
  getParentObjects,
  getSceneryLocations,
  preloadSceneryLocations,
} from "./locations";
import { CacheProvider, ObjID, Location, LocationsDefinition } from "../cache2";
import { Obj } from "../cache2/loaders/Obj";
import { RegionMapper, RegionInfo } from "../cache2/loaders/RegionMapper";

// Mock the Obj class methods
jest.mock("../cache2/loaders/Obj");
jest.mock("../cache2/loaders/RegionMapper");
jest.mock("../cache2", () => {
  const original = jest.requireActual("../cache2");
  return {
    ...original,
    LocationsDefinition: {
      decode: jest.fn(),
    },
  };
});

describe("locations utilities", () => {
  let mockCache: CacheProvider;
  let mockGetArchives: jest.Mock;
  let mockGetArchive: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    clearLocationCache();

    mockGetArchives = jest.fn();
    mockGetArchive = jest.fn();

    mockCache = {
      getArchives: mockGetArchives,
      getArchive: mockGetArchive,
    } as unknown as CacheProvider;
  });

  const createMockLocation = (
    id: number,
    x: number,
    y: number,
    z: number
  ): Location =>
    ({
      getId: () => id,
      getPosition: () => ({
        getX: () => x,
        getY: () => y,
        getZ: () => z,
      }),
    } as Location);

  describe("getSceneryLocations", () => {
    it("should return empty array when object has no locations", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);
      mockGetArchives.mockResolvedValue([]);

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      expect(locations).toEqual([]);
    });

    it("should return locations for an object with direct spawns", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);

      const mockLocation = createMockLocation(123, 1000, 2000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [mockLocation],
      });

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      expect(locations).toHaveLength(1);
      expect(locations[0].getId()).toBe(123);
    });

    it("should deduplicate locations at the same position", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);

      // Two locations at same position but different IDs
      const loc1 = createMockLocation(123, 1000, 2000, 0);
      const loc2 = createMockLocation(123, 1000, 2000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [loc1, loc2],
      });

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      // Should only have one location after deduplication
      expect(locations).toHaveLength(1);
    });

    it("should cache results across multiple calls", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);

      const mockLocation = createMockLocation(123, 1000, 2000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [mockLocation],
      });

      // First call
      await getSceneryLocations(mockCache, 123 as ObjID);

      // Second call should use cache
      await getSceneryLocations(mockCache, 123 as ObjID);

      // getArchives should only be called once
      expect(mockGetArchives).toHaveBeenCalledTimes(1);
    });

    it("should handle errors gracefully when loading locations", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);
      mockGetArchives.mockRejectedValue(new Error("Cache error"));

      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      expect(locations).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getSceneryLocations with multiChildren", () => {
    it("should include parent locations for child objects", async () => {
      // Create mock parent with proper multiChildren structure
      const mockParent = {
        id: 456 as ObjID,
        multiChildren: [123 as ObjID],
      } as unknown as Obj;

      jest.spyOn(Obj, "all").mockResolvedValue([mockParent]);

      const childLocation = createMockLocation(123, 1000, 2000, 0);
      const parentLocation = createMockLocation(456, 3000, 4000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [childLocation, parentLocation],
      });

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      // Should include both child and parent locations
      expect(locations.length).toBe(2);
    });

    it("should deduplicate overlapping parent and child locations", async () => {
      // Create mock parent with proper multiChildren structure
      const mockParent = {
        id: 456 as ObjID,
        multiChildren: [123 as ObjID],
      } as unknown as Obj;

      jest.spyOn(Obj, "all").mockResolvedValue([mockParent]);

      // Both at same position
      const childLocation = createMockLocation(123, 1000, 2000, 0);
      const parentLocation = createMockLocation(456, 1000, 2000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [childLocation, parentLocation],
      });

      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      // Should only have one location after deduplication
      expect(locations).toHaveLength(1);
    });
  });

  describe("getParentObjects", () => {
    it("should return empty array when object has no parents", async () => {
      // Mock Obj.all to return no objects
      jest.spyOn(Obj, "all").mockResolvedValue([]);
      mockGetArchives.mockResolvedValue([]);

      const parents = await getParentObjects(mockCache, 123 as ObjID);

      expect(parents).toEqual([]);
    });

    it("should find parent objects that have child in multiChildren", async () => {
      // Create mock parent object
      const mockParent = {
        id: 456 as ObjID,
        multiChildren: [123 as ObjID, 124 as ObjID],
      } as unknown as Obj;

      jest.spyOn(Obj, "all").mockResolvedValue([mockParent]);
      mockGetArchives.mockResolvedValue([]);

      jest.spyOn(Obj, "load").mockImplementation(async (_cachePromise, id) => {
        if (id === (456 as ObjID)) return mockParent as never;
        return null as never;
      });

      const parents = await getParentObjects(mockCache, 123 as ObjID);

      expect(parents).toHaveLength(1);
      expect(parents[0]).toBeDefined();
      expect(parents[0]?.id).toBe(456);
    });

    it("should find multiple parents for the same child", async () => {
      const mockParent1 = {
        id: 456 as ObjID,
        multiChildren: [123 as ObjID, 124 as ObjID],
      } as unknown as Obj;

      const mockParent2 = {
        id: 789 as ObjID,
        multiChildren: [123 as ObjID, 999 as ObjID],
      } as unknown as Obj;

      jest.spyOn(Obj, "all").mockResolvedValue([mockParent1, mockParent2]);
      mockGetArchives.mockResolvedValue([]);

      jest.spyOn(Obj, "load").mockImplementation(async (_cachePromise, id) => {
        if (id === (456 as ObjID)) return mockParent1 as never;
        if (id === (789 as ObjID)) return mockParent2 as never;
        return null as never;
      });

      const parents = await getParentObjects(mockCache, 123 as ObjID);

      expect(parents).toHaveLength(2);
      expect(parents[0]).toBeDefined();
      expect(parents[1]).toBeDefined();
      expect(parents.map((p) => p?.id)).toEqual([456, 789]);
    });

    it("should ignore invalid child IDs", async () => {
      const mockParent = {
        id: 456 as ObjID,
        multiChildren: [-1 as ObjID, 0 as ObjID, 123 as ObjID],
      } as unknown as Obj;

      jest.spyOn(Obj, "all").mockResolvedValue([mockParent]);
      mockGetArchives.mockResolvedValue([]);
      jest.spyOn(Obj, "load").mockResolvedValue(mockParent as never);

      const parents = await getParentObjects(mockCache, 123 as ObjID);

      expect(parents).toHaveLength(1);
    });
  });

  describe("getSceneryLocations caching", () => {
    it("should cache parent index on first load", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      await getSceneryLocations(mockCache, 123 as ObjID);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Built parent index")
      );

      consoleLogSpy.mockRestore();
    });
  });

  describe("preloadSceneryLocations", () => {
    it("should preload all locations from archives", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);

      const mockLocation = createMockLocation(123, 1000, 2000, 0);

      mockGetArchives.mockResolvedValue([1]);
      mockGetArchive.mockResolvedValue({
        namehash: 12345,
        getFile: () => ({ data: Buffer.alloc(0) }),
      });

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [mockLocation],
      });

      await preloadSceneryLocations(mockCache);

      // Verify locations are cached - subsequent call should not decode again
      (LocationsDefinition.decode as jest.Mock).mockClear();
      const locations = await getSceneryLocations(mockCache, 123 as ObjID);

      expect(LocationsDefinition.decode).not.toHaveBeenCalled();
      expect(locations).toHaveLength(1);
    });

    it("should build parent index during preload", async () => {
      jest.spyOn(Obj, "all").mockResolvedValue([]);
      mockGetArchives.mockResolvedValue([]);

      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();

      jest.spyOn(RegionMapper, "getRegionFromArchiveId").mockReturnValue({
        type: "locations",
        regionX: 10,
        regionY: 20,
      } as RegionInfo);

      (LocationsDefinition.decode as jest.Mock).mockReturnValue({
        locations: [],
      });

      await preloadSceneryLocations(mockCache);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining("Built parent index")
      );

      consoleLogSpy.mockRestore();
    });
  });
});
