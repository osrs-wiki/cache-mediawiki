import {
  clearWorldMapCache,
  getAreaNameForLocation,
  getAreaNamesForLocations,
  getNearestArea,
} from "./worldmap";
import { Area, CacheProvider, Location, Position, WorldMap } from "../cache2";
import {
  AreaID,
  LocationID,
  LocationOrientation,
  LocationType,
  WorldX,
  WorldY,
} from "../cache2/types";

jest.mock("../cache2/loaders/WorldMap");
jest.mock("../cache2/loaders/Area");

describe("worldmap utilities", () => {
  let mockCache: CacheProvider;

  beforeEach(() => {
    mockCache = {} as CacheProvider;
    clearWorldMapCache();
    jest.clearAllMocks();
  });

  describe("getAreaNameForLocation", () => {
    it("should return area name for location with closest element", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
          {
            areaDefinitionId: 43 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3400 as WorldX, 3400 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue({ name: "Lumbridge" } as Area);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3200 as WorldX, 3200 as WorldY, 0)
      );

      const areaName = await getAreaNameForLocation(mockCache, location);

      expect(areaName).toBe("Lumbridge");
      expect(Area.load).toHaveBeenCalledWith(mockCache, 42);
    });

    it("should return null if no elements found", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3200 as WorldX, 3200 as WorldY, 0)
      );

      const areaName = await getAreaNameForLocation(mockCache, location);

      expect(areaName).toBeNull();
    });

    it("should find closest element based on distance", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
          {
            areaDefinitionId: 43 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3205 as WorldX, 3205 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue({ name: "Varrock" } as Area);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3204 as WorldX, 3204 as WorldY, 0)
      );

      const areaName = await getAreaNameForLocation(mockCache, location);

      expect(areaName).toBe("Varrock");
      expect(Area.load).toHaveBeenCalledWith(mockCache, 43);
    });

    it("should return null if area fails to load", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue(null);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3200 as WorldX, 3200 as WorldY, 0)
      );

      const areaName = await getAreaNameForLocation(mockCache, location);

      expect(areaName).toBeNull();
    });

    it("should cache world map between calls", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue({ name: "Test" } as Area);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3200 as WorldX, 3200 as WorldY, 0)
      );

      await getAreaNameForLocation(mockCache, location);
      await getAreaNameForLocation(mockCache, location);

      expect(WorldMap.load).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAreaNamesForLocations", () => {
    it("should return map of location coordinates to area names", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
          {
            areaDefinitionId: 43 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3400 as WorldX, 3400 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockImplementation(
        async (_cache, id: AreaID) => {
          if (id === (42 as AreaID)) return { name: "Lumbridge" } as Area;
          if (id === (43 as AreaID)) return { name: "Varrock" } as Area;
          return null;
        }
      );

      const locations = [
        new Location(
          1 as LocationID,
          0 as LocationType,
          0 as LocationOrientation,
          new Position(3205 as WorldX, 3205 as WorldY, 0)
        ),
        new Location(
          2 as LocationID,
          0 as LocationType,
          0 as LocationOrientation,
          new Position(3395 as WorldX, 3405 as WorldY, 0)
        ),
        new Location(
          3 as LocationID,
          0 as LocationType,
          0 as LocationOrientation,
          new Position(3210 as WorldX, 3195 as WorldY, 0)
        ),
      ];

      const areaNames = await getAreaNamesForLocations(mockCache, locations);

      expect(areaNames.size).toBe(3);
      expect(areaNames.get("3205,3205,0")).toBe("Lumbridge"); // Closest to 42
      expect(areaNames.get("3395,3405,0")).toBe("Varrock"); // Closest to 43
      expect(areaNames.get("3210,3195,0")).toBe("Lumbridge"); // Closest to 42

      // Should batch load - only 2 unique areas
      expect(Area.load).toHaveBeenCalledTimes(2);
    });

    it("should return empty map for empty location array", async () => {
      const areaNames = await getAreaNamesForLocations(mockCache, []);

      expect(areaNames.size).toBe(0);
    });

    it("should handle missing areas gracefully", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue(null);

      const locations = [
        new Location(
          1 as LocationID,
          0 as LocationType,
          0 as LocationOrientation,
          new Position(3200 as WorldX, 3200 as WorldY, 0)
        ),
      ];

      const areaNames = await getAreaNamesForLocations(mockCache, locations);

      expect(areaNames.size).toBe(0);
    });

    it("should cache world map between calls", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      (Area.load as jest.Mock).mockResolvedValue({ name: "Test" } as Area);

      const location = new Location(
        1 as LocationID,
        0 as LocationType,
        0 as LocationOrientation,
        new Position(3200 as WorldX, 3200 as WorldY, 0)
      );

      await getAreaNameForLocation(mockCache, location);
      await getAreaNamesForLocations(mockCache, [location]);

      expect(WorldMap.load).toHaveBeenCalledTimes(1);
    });
  });

  describe("getNearestArea", () => {
    it("should return nearest area to a position", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
          {
            areaDefinitionId: 43 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3400 as WorldX, 3400 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      const mockArea = { name: "Lumbridge", id: 42 as AreaID } as Area;
      (Area.load as jest.Mock).mockResolvedValue(mockArea);

      const position = new Position(3210 as WorldX, 3210 as WorldY, 0);
      const result = await getNearestArea(mockCache, position);

      expect(result).toBe(mockArea);
      expect(Area.load).toHaveBeenCalledWith(mockCache, 42);
    });

    it("should exclude specified area ID", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
          {
            areaDefinitionId: 43 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3400 as WorldX, 3400 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);
      const mockArea = { name: "Varrock", id: 43 as AreaID } as Area;
      (Area.load as jest.Mock).mockResolvedValue(mockArea);

      // Position is closer to area 42, but we exclude it
      const position = new Position(3210 as WorldX, 3210 as WorldY, 0);
      const result = await getNearestArea(mockCache, position, 42);

      expect(result).toBe(mockArea);
      expect(Area.load).toHaveBeenCalledWith(mockCache, 43);
    });

    it("should return null when no elements exist", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);

      const position = new Position(3210 as WorldX, 3210 as WorldY, 0);
      const result = await getNearestArea(mockCache, position);

      expect(result).toBeNull();
    });

    it("should return null when all elements are excluded", async () => {
      const mockWorldMap = {
        getElements: jest.fn().mockReturnValue([
          {
            areaDefinitionId: 42 as AreaID,
            getWorldPosition: jest
              .fn()
              .mockReturnValue(new Position(3200 as WorldX, 3200 as WorldY, 0)),
          },
        ]),
      };
      (WorldMap.load as jest.Mock).mockResolvedValue(mockWorldMap);

      const position = new Position(3210 as WorldX, 3210 as WorldY, 0);
      const result = await getNearestArea(mockCache, position, 42);

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      (WorldMap.load as jest.Mock).mockRejectedValue(new Error("Load failed"));

      const position = new Position(3210 as WorldX, 3210 as WorldY, 0);
      const result = await getNearestArea(mockCache, position);

      expect(result).toBeNull();
    });
  });
});
