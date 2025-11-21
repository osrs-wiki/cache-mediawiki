import { MapSquare } from "./MapSquare";
import { Position } from "./Position";
import { WorldMap } from "./WorldMap";
import { WorldMapComposite } from "./WorldMapComposite";
import { WorldMapElement } from "./WorldMapElement";
import { Zone } from "./Zone";
import type { CacheProvider } from "../Cache";
import { Reader } from "../Reader";
import { WorldMapCompositeID, WorldX, WorldY } from "../types";

describe("MapSquare", () => {
  describe("decodeFromStream", () => {
    it("should decode a map square with type 0", () => {
      // Create a buffer with map square data
      const buffer = new ArrayBuffer(25);
      const view = new DataView(buffer);
      let offset = 0;

      // Type (must be 0)
      view.setUint8(offset++, 0);
      // minLevel
      view.setUint8(offset++, 0);
      // levels
      view.setUint8(offset++, 4);
      // sourceSquareX
      view.setUint16(offset, 50);
      offset += 2;
      // sourceSquareZ
      view.setUint16(offset, 50);
      offset += 2;
      // displaySquareX
      view.setUint16(offset, 48);
      offset += 2;
      // displaySquareZ
      view.setUint16(offset, 48);
      offset += 2;
      // groupId (BigSmart2 - using simple value)
      view.setUint16(offset, 100);
      offset += 2;
      // fileId (BigSmart2 - using simple value)
      view.setUint16(offset, 200);

      const reader = new Reader(buffer);
      const mapSquare = MapSquare.decodeFromStream(reader);

      expect(mapSquare.minLevel).toBe(0);
      expect(mapSquare.levels).toBe(4);
      expect(mapSquare.sourceSquareX).toBe(50);
      expect(mapSquare.sourceSquareZ).toBe(50);
      expect(mapSquare.displaySquareX).toBe(48);
      expect(mapSquare.displaySquareZ).toBe(48);
      expect(mapSquare.groupId).toBe(100);
      expect(mapSquare.fileId).toBe(200);
    });

    it("should throw error if type is not 0", () => {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, 1); // Wrong type

      const reader = new Reader(buffer);
      expect(() => MapSquare.decodeFromStream(reader)).toThrow(
        "Expected worldMapDataType 0 got 1"
      );
    });
  });
});

describe("Zone", () => {
  describe("decodeFromStream", () => {
    it("should decode a zone with type 1", () => {
      // Create a buffer with zone data
      const buffer = new ArrayBuffer(29);
      const view = new DataView(buffer);
      let offset = 0;

      // Type (must be 1)
      view.setUint8(offset++, 1);
      // minLevel
      view.setUint8(offset++, 0);
      // levels
      view.setUint8(offset++, 4);
      // sourceSquareX
      view.setUint16(offset, 50);
      offset += 2;
      // sourceSquareZ
      view.setUint16(offset, 50);
      offset += 2;
      // sourceZoneX
      view.setUint8(offset++, 3);
      // sourceZoneZ
      view.setUint8(offset++, 5);
      // displaySquareX
      view.setUint16(offset, 48);
      offset += 2;
      // displaySquareZ
      view.setUint16(offset, 48);
      offset += 2;
      // displayZoneX
      view.setUint8(offset++, 2);
      // displayZoneZ
      view.setUint8(offset++, 4);
      // groupId (BigSmart2)
      view.setUint16(offset, 100);
      offset += 2;
      // fileId (BigSmart2)
      view.setUint16(offset, 200);

      const reader = new Reader(buffer);
      const zone = Zone.decodeFromStream(reader);

      expect(zone.minLevel).toBe(0);
      expect(zone.levels).toBe(4);
      expect(zone.sourceSquareX).toBe(50);
      expect(zone.sourceSquareZ).toBe(50);
      expect(zone.sourceZoneX).toBe(3);
      expect(zone.sourceZoneZ).toBe(5);
      expect(zone.displaySquareX).toBe(48);
      expect(zone.displaySquareZ).toBe(48);
      expect(zone.displayZoneX).toBe(2);
      expect(zone.displayZoneZ).toBe(4);
      expect(zone.groupId).toBe(100);
      expect(zone.fileId).toBe(200);
    });

    it("should throw error if type is not 1", () => {
      const buffer = new ArrayBuffer(1);
      const view = new DataView(buffer);
      view.setUint8(0, 0); // Wrong type

      const reader = new Reader(buffer);
      expect(() => Zone.decodeFromStream(reader)).toThrow(
        "Expected worldMapDataType 1 got 0"
      );
    });
  });
});

describe("WorldMapElement", () => {
  describe("decodeFromStream", () => {
    it("should decode a world map element", () => {
      // Create a buffer with element data
      const buffer = new ArrayBuffer(7);
      const view = new DataView(buffer);
      let offset = 0;

      // areaDefinitionId (BigSmart2)
      view.setUint16(offset, 42);
      offset += 2;
      // position (packed)
      const packedPosition = (0 << 28) | (3200 << 14) | 3200; // z=0, x=3200, y=3200
      view.setInt32(offset, packedPosition);
      offset += 4;
      // membersOnly
      view.setUint8(offset, 1);

      const reader = new Reader(buffer);
      const element = WorldMapElement.decodeFromStream(reader);

      expect(element.areaDefinitionId).toBe(42);
      expect(element.position.x).toBe(3200);
      expect(element.position.y).toBe(3200);
      expect(element.position.z).toBe(0);
      expect(element.membersOnly).toBe(true);
      expect(element.offset).toBeNull();
    });

    it("should handle non-members element", () => {
      const buffer = new ArrayBuffer(7);
      const view = new DataView(buffer);

      view.setUint16(0, 10);
      view.setInt32(2, (0 << 28) | (1000 << 14) | 2000);
      view.setUint8(6, 0); // Not members only

      const reader = new Reader(buffer);
      const element = WorldMapElement.decodeFromStream(reader);

      expect(element.membersOnly).toBe(false);
    });
  });

  describe("getWorldPosition", () => {
    it("should return position when offset is null", () => {
      const element = new WorldMapElement();
      element.position = new Position(3200 as WorldX, 3200 as WorldY, 0);
      element.offset = null;

      const worldPos = element.getWorldPosition();
      expect(worldPos.x).toBe(3200);
      expect(worldPos.y).toBe(3200);
      expect(worldPos.z).toBe(0);
    });

    it("should apply offset when present", () => {
      const element = new WorldMapElement();
      element.position = new Position(3200 as WorldX, 3200 as WorldY, 0);
      element.offset = new Position(128 as WorldX, -64 as WorldY, 1);

      const worldPos = element.getWorldPosition();
      expect(worldPos.x).toBe(3328); // 3200 + 128
      expect(worldPos.y).toBe(3136); // 3200 + (-64)
      expect(worldPos.z).toBe(1);
    });
  });
});

describe("WorldMapComposite", () => {
  describe("decode", () => {
    it("should decode a complete world map composite", () => {
      // Create a minimal composite with 1 map square, 1 zone, 1 element
      const buffer = new ArrayBuffer(100);
      const view = new DataView(buffer);
      let offset = 0;

      // Map square count
      view.setUint16(offset, 1);
      offset += 2;

      // Map square data (type 0)
      view.setUint8(offset++, 0); // type
      view.setUint8(offset++, 0); // minLevel
      view.setUint8(offset++, 4); // levels
      view.setUint16(offset, 50);
      offset += 2; // sourceSquareX
      view.setUint16(offset, 50);
      offset += 2; // sourceSquareZ
      view.setUint16(offset, 50);
      offset += 2; // displaySquareX
      view.setUint16(offset, 50);
      offset += 2; // displaySquareZ
      view.setUint16(offset, 100);
      offset += 2; // groupId
      view.setUint16(offset, 200);
      offset += 2; // fileId

      // Zone count
      view.setUint16(offset, 0);
      offset += 2;

      // Element count
      view.setUint16(offset, 1);
      offset += 2;

      // Element data
      view.setUint16(offset, 42);
      offset += 2; // areaDefinitionId
      const packedPosition = (0 << 28) | (3200 << 14) | 3200;
      view.setInt32(offset, packedPosition);
      offset += 4; // position
      view.setUint8(offset, 1); // membersOnly

      const reader = new Reader(buffer);
      const composite = WorldMapComposite.decode(
        reader,
        0 as WorldMapCompositeID
      );

      expect(composite.id).toBe(0);
      expect(composite.mapSquares).toHaveLength(1);
      expect(composite.zones).toHaveLength(0);
      expect(composite.elements).toHaveLength(1);

      expect(composite.mapSquares[0].sourceSquareX).toBe(50);
      expect(composite.elements[0].areaDefinitionId).toBe(42);
      expect(composite.elements[0].position.x).toBe(3200);
    });
  });

  describe("calculateWorldOffset", () => {
    it("should return null when position does not match any squares or zones", () => {
      const composite = new WorldMapComposite(0 as WorldMapCompositeID);
      const position = new Position(1000 as WorldX, 1000 as WorldY, 0);

      const offset = composite.calculateWorldOffset(position);
      expect(offset).toBeNull();
    });

    it("should calculate offset from map square", () => {
      const composite = new WorldMapComposite(0 as WorldMapCompositeID);

      const mapSquare = new MapSquare();
      mapSquare.sourceSquareX = 52;
      mapSquare.sourceSquareZ = 52;
      mapSquare.displaySquareX = 50;
      mapSquare.displaySquareZ = 50;
      mapSquare.minLevel = 0;
      composite.mapSquares.push(mapSquare);

      // Position in square 50, 50 (tiles 3200-3263)
      const position = new Position(3200 as WorldX, 3200 as WorldY, 0);

      const offset = composite.calculateWorldOffset(position);
      expect(offset).not.toBeNull();
      if (offset) {
        expect(offset.x).toBe(128); // (52 - 50) * 64 = 128
        expect(offset.y).toBe(128); // (52 - 50) * 64 = 128
        expect(offset.z).toBe(0);
      }
    });

    it("should calculate offset from zone, overriding map square", () => {
      const composite = new WorldMapComposite(0 as WorldMapCompositeID);

      // Add map square
      const mapSquare = new MapSquare();
      mapSquare.sourceSquareX = 52;
      mapSquare.sourceSquareZ = 52;
      mapSquare.displaySquareX = 50;
      mapSquare.displaySquareZ = 50;
      mapSquare.minLevel = 0;
      composite.mapSquares.push(mapSquare);

      // Add zone with more specific offset
      const zone = new Zone();
      zone.sourceSquareX = 52;
      zone.sourceSquareZ = 52;
      zone.sourceZoneX = 3;
      zone.sourceZoneZ = 3;
      zone.displaySquareX = 50;
      zone.displaySquareZ = 50;
      zone.displayZoneX = 0;
      zone.displayZoneZ = 0;
      zone.minLevel = 1;
      composite.zones.push(zone);

      // Position in zone 0,0 of square 50,50 (tiles 3200-3207)
      const position = new Position(3200 as WorldX, 3200 as WorldY, 0);

      const offset = composite.calculateWorldOffset(position);
      expect(offset).not.toBeNull();
      if (offset) {
        // Square offset: (52-50)*64 = 128, Zone offset: (3-0)*8 = 24
        expect(offset.x).toBe(152); // 128 + 24
        expect(offset.y).toBe(152); // 128 + 24
        expect(offset.z).toBe(1);
      }
    });

    it("should handle negative offsets", () => {
      const composite = new WorldMapComposite(0 as WorldMapCompositeID);

      const mapSquare = new MapSquare();
      mapSquare.sourceSquareX = 48;
      mapSquare.sourceSquareZ = 48;
      mapSquare.displaySquareX = 50;
      mapSquare.displaySquareZ = 50;
      mapSquare.minLevel = 0;
      composite.mapSquares.push(mapSquare);

      const position = new Position(3200 as WorldX, 3200 as WorldY, 0);

      const offset = composite.calculateWorldOffset(position);
      expect(offset).not.toBeNull();
      if (offset) {
        expect(offset.x).toBe(-128); // (48 - 50) * 64 = -128
        expect(offset.y).toBe(-128);
      }
    });
  });
});

describe("WorldMap", () => {
  describe("load", () => {
    it("should load all composites and aggregate elements", async () => {
      // Create mock cache with composite map archive
      const mockArchive = {
        getFiles: () => {
          const map = new Map();
          // Create two composite files
          for (let i = 0; i < 2; i++) {
            const buffer = new ArrayBuffer(100);
            const view = new DataView(buffer);
            let offset = 0;

            // Map square count
            view.setUint16(offset, 1);
            offset += 2;

            // Map square data
            view.setUint8(offset++, 0); // type
            view.setUint8(offset++, 0); // minLevel
            view.setUint8(offset++, 4); // levels
            view.setUint16(offset, 50 + i);
            offset += 2; // sourceSquareX
            view.setUint16(offset, 50);
            offset += 2; // sourceSquareZ
            view.setUint16(offset, 50);
            offset += 2; // displaySquareX
            view.setUint16(offset, 50);
            offset += 2; // displaySquareZ
            view.setUint16(offset, 100);
            offset += 2; // groupId
            view.setUint16(offset, 200);
            offset += 2; // fileId

            // Zone count
            view.setUint16(offset, 0);
            offset += 2;

            // Element count (2 elements per composite)
            view.setUint16(offset, 2);
            offset += 2;

            // Element 1
            view.setUint16(offset, 10 + i);
            offset += 2; // areaDefinitionId
            const packedPos1 = (0 << 28) | (3200 << 14) | 3200;
            view.setInt32(offset, packedPos1);
            offset += 4;
            view.setUint8(offset++, 1); // membersOnly

            // Element 2
            view.setUint16(offset, 20 + i);
            offset += 2; // areaDefinitionId
            const packedPos2 = (0 << 28) | (3300 << 14) | 3300;
            view.setInt32(offset, packedPos2);
            offset += 4;
            view.setUint8(offset++, 0); // membersOnly

            map.set(i, { data: buffer });
          }
          return map;
        },
      };

      const mockCache: CacheProvider = {
        getArchiveByName: jest.fn().mockResolvedValue(mockArchive),
        getVersion: jest.fn().mockResolvedValue(1),
      } as unknown as CacheProvider;

      const worldMap = await WorldMap.load(mockCache);

      expect(worldMap.getComposites()).toHaveLength(2);
      expect(worldMap.getElements()).toHaveLength(4); // 2 composites * 2 elements each

      // Verify composites
      const composites = worldMap.getComposites();
      expect(composites[0].id).toBe(0);
      expect(composites[1].id).toBe(1);

      // Verify elements are aggregated
      const elements = worldMap.getElements();
      expect(elements[0].areaDefinitionId).toBe(10);
      expect(elements[1].areaDefinitionId).toBe(20);
      expect(elements[2].areaDefinitionId).toBe(11);
      expect(elements[3].areaDefinitionId).toBe(21);
    });

    it("should return empty WorldMap when archive not found", async () => {
      const mockCache: CacheProvider = {
        getArchiveByName: jest.fn().mockResolvedValue(null),
        getVersion: jest.fn().mockResolvedValue(1),
      } as unknown as CacheProvider;

      const worldMap = await WorldMap.load(mockCache);

      expect(worldMap.getComposites()).toHaveLength(0);
      expect(worldMap.getElements()).toHaveLength(0);
    });

    it("should handle composites with no elements", async () => {
      const mockArchive = {
        getFiles: () => {
          const map = new Map();
          const buffer = new ArrayBuffer(50);
          const view = new DataView(buffer);
          let offset = 0;

          // Map square count: 0
          view.setUint16(offset, 0);
          offset += 2;

          // Zone count: 0
          view.setUint16(offset, 0);
          offset += 2;

          // Element count: 0
          view.setUint16(offset, 0);

          map.set(0, { data: buffer });
          return map;
        },
      };

      const mockCache: CacheProvider = {
        getArchiveByName: jest.fn().mockResolvedValue(mockArchive),
        getVersion: jest.fn().mockResolvedValue(1),
      } as unknown as CacheProvider;

      const worldMap = await WorldMap.load(mockCache);

      expect(worldMap.getComposites()).toHaveLength(1);
      expect(worldMap.getElements()).toHaveLength(0);
    });
  });
});
