import { Tile } from "./Tile";
import { PerArchiveLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { RegionX, RegionY, IndexType, OverlayID, UnderlayID } from "../types";

@Typed
export class MapDefinition extends PerArchiveLoadable {
  public static readonly X = 64;
  public static readonly Y = 64;
  public static readonly Z = 4;

  public static readonly index = IndexType.Maps;
  public static readonly gameval: undefined = undefined;

  public regionX: RegionX;
  public regionY: RegionY;
  public tiles: Tile[][][] = [];

  constructor(regionX: RegionX, regionY: RegionY) {
    super();
    this.regionX = regionX;
    this.regionY = regionY;

    // Initialize 3D tile array
    this.tiles = new Array(MapDefinition.Z);
    for (let z = 0; z < MapDefinition.Z; z++) {
      this.tiles[z] = new Array(MapDefinition.X);
      for (let x = 0; x < MapDefinition.X; x++) {
        this.tiles[z][x] = new Array(MapDefinition.Y);
        for (let y = 0; y < MapDefinition.Y; y++) {
          this.tiles[z][x][y] = new Tile();
        }
      }
    }
  }

  public get id(): number {
    return (this.regionX << 8) | this.regionY;
  }

  public readonly gameVal: undefined = undefined;

  public static decode(
    r: Reader,
    regionX: RegionX,
    regionY: RegionY
  ): MapDefinition {
    const mapDef = new MapDefinition(regionX, regionY);

    // Decode terrain data following RuneLite's MapLoader pattern
    // This is a complex binary format - simplified implementation
    // Full implementation would follow RuneLite's exact decoding logic

    try {
      // Basic terrain decoding - this would need full implementation
      // based on RuneLite's MapLoader format
      for (let z = 0; z < MapDefinition.Z; z++) {
        for (let x = 0; x < MapDefinition.X; x++) {
          for (let y = 0; y < MapDefinition.Y; y++) {
            const tile = mapDef.tiles[z][x][y];
            // Decode tile data from reader
            // This is a placeholder - actual implementation needed

            // For now, just read some basic data structure
            if (r.remaining >= 2) {
              tile.overlayId = r.u8() as OverlayID;
              tile.underlayId = r.u8() as UnderlayID;
            }
          }
        }
      }
    } catch (error) {
      console.warn(
        `Failed to decode map definition for region ${regionX},${regionY}:`,
        error
      );
    }

    return mapDef;
  }

  /**
   * Compares this MapDefinition with another and returns the number of tiles that are different.
   * Two tiles are considered different if any of their properties (height, overlayId, underlayId,
   * overlayPath, overlayRotation, settings, or attrOpcode) don't match.
   *
   * @param other The other MapDefinition to compare against
   * @returns The number of tiles that are not identical between the two MapDefinitions
   */
  public getDifferentTileCount(other: MapDefinition): number {
    if (!other) {
      // If comparing against null/undefined, all tiles are different
      return MapDefinition.X * MapDefinition.Y * MapDefinition.Z;
    }

    if (this.regionX !== other.regionX || this.regionY !== other.regionY) {
      // If comparing different regions, all tiles are different
      return MapDefinition.X * MapDefinition.Y * MapDefinition.Z;
    }

    let differentCount = 0;

    for (let z = 0; z < MapDefinition.Z; z++) {
      for (let x = 0; x < MapDefinition.X; x++) {
        for (let y = 0; y < MapDefinition.Y; y++) {
          const thisTile = this.tiles[z][x][y];
          const otherTile = other.tiles[z][x][y];

          if (!thisTile.equals(otherTile)) {
            differentCount++;
          }
        }
      }
    }

    return differentCount;
  }
}
