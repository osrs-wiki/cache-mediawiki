import { MapSquare } from "./MapSquare";
import { Position } from "./Position";
import { WorldMapElement } from "./WorldMapElement";
import { Zone } from "./Zone";
import type { CacheProvider } from "../Cache";
import { Loadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { WorldMapCompositeID, WorldX, WorldY } from "../types";

/**
 * Represents a composite world map definition containing map squares, zones, and elements.
 * Loaded from the WORLDMAP index, archive "compositemap".
 * Based on RuneLite's WorldMapManager and WorldMapCompositeLoader.
 */
@Typed
export class WorldMapComposite extends Loadable {
  public static readonly index = 22; // WORLDMAP index

  public mapSquares: MapSquare[] = [];
  public zones: Zone[] = [];
  public elements: WorldMapElement[] = [];

  constructor(public id: WorldMapCompositeID) {
    super();
  }

  /**
   * Decodes a WorldMapComposite from a Reader.
   *
   * @param r The Reader to decode from
   * @param id The ID of this composite map
   * @returns A decoded WorldMapComposite instance
   */
  public static decode(r: Reader, id: WorldMapCompositeID): WorldMapComposite {
    const v = new WorldMapComposite(id);

    // Read map squares (type 0)
    const mapSquareCount = r.u16();
    for (let i = 0; i < mapSquareCount; i++) {
      v.mapSquares.push(MapSquare.decodeFromStream(r));
    }

    // Read zones (type 1)
    const zoneCount = r.u16();
    for (let i = 0; i < zoneCount; i++) {
      v.zones.push(Zone.decodeFromStream(r));
    }

    // Read elements (icons)
    const elementCount = r.u16();
    for (let i = 0; i < elementCount; i++) {
      v.elements.push(WorldMapElement.decodeFromStream(r));
    }

    // Calculate offsets for elements based on their positions
    for (const element of v.elements) {
      element.offset = v.calculateWorldOffset(element.position);
    }

    return v;
  }

  /**
   * Calculates the world offset for a given position based on map squares and zones.
   * Map squares provide coarse-grained offsets (64x64 tiles),
   * while zones provide fine-grained offsets (8x8 tiles within a square).
   *
   * @param position The position to calculate the offset for
   * @returns The calculated offset Position, or null if no offset applies
   */
  public calculateWorldOffset(position: Position): Position | null {
    const squareX = Math.floor(position.x / 64);
    const squareZ = Math.floor(position.y / 64);
    const zoneX = Math.floor((position.x & 63) / 8);
    const zoneZ = Math.floor((position.y & 63) / 8);
    let offset: Position | null = null;

    // Check map squares for coarse offset
    for (const mapSquare of this.mapSquares) {
      if (
        squareX === mapSquare.displaySquareX &&
        squareZ === mapSquare.displaySquareZ
      ) {
        const shiftX =
          (mapSquare.sourceSquareX - mapSquare.displaySquareX) * 64;
        const shiftZ =
          (mapSquare.sourceSquareZ - mapSquare.displaySquareZ) * 64;
        offset = new Position(
          shiftX as WorldX,
          shiftZ as WorldY,
          mapSquare.minLevel
        );
      }
    }

    // Check zones for more specific offset (overrides map square if found)
    for (const zone of this.zones) {
      if (
        squareX === zone.displaySquareX &&
        squareZ === zone.displaySquareZ &&
        zoneX === zone.displayZoneX &&
        zoneZ === zone.displayZoneZ
      ) {
        const shiftX =
          (zone.sourceSquareX - zone.displaySquareX) * 64 +
          (zone.sourceZoneX - zone.displayZoneX) * 8;
        const shiftZ =
          (zone.sourceSquareZ - zone.displaySquareZ) * 64 +
          (zone.sourceZoneZ - zone.displayZoneZ) * 8;
        offset = new Position(
          shiftX as WorldX,
          shiftZ as WorldY,
          zone.minLevel
        );
      }
    }

    return offset;
  }

  /**
   * Loads all world map composites from the cache.
   * Each file in the "compositemap" archive represents one composite map.
   *
   * @param cache0 The cache provider to load from
   * @returns An array of all WorldMapComposite instances
   */
  public static async loadAll(
    cache0: CacheProvider | Promise<CacheProvider>
  ): Promise<WorldMapComposite[]> {
    const cache = await cache0;
    const index = this.index;
    const archive = await cache.getArchiveByName(index, "compositemap");

    if (!archive) {
      return [];
    }

    const version = await cache.getVersion(index);
    const files = [...archive.getFiles().values()];

    return files.map((file, idx) => {
      const reader = new Reader(file.data, version);
      return WorldMapComposite.decode(reader, idx as WorldMapCompositeID);
    });
  }

  /**
   * Loads data for a specific composite map by archive ID.
   *
   * @param cache The cache provider
   * @param archiveName The name of the archive (should be "compositemap")
   * @returns A Reader for the archive data, or undefined if not found
   */
  public static async loadData(
    this: { index: number },
    cache: CacheProvider,
    archiveName: string
  ): Promise<Reader | undefined> {
    const archive = await cache.getArchiveByName(this.index, archiveName);
    const version = await cache.getVersion(this.index);
    const data = archive?.getFile(0)?.data;
    return data ? new Reader(data, version) : undefined;
  }
}
