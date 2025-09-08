import { Location } from "./Location";
import { LocationsDefinition } from "./LocationsDefinition";
import { MapDefinition } from "./MapDefinition";
import { Tile } from "./Tile";
import { PerArchiveLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { RegionX, RegionY, IndexType, RegionID } from "../types";

/**
 * Represents a complete region containing both map and location data.
 * Based on RuneLite's Region class.
 */
export class Region extends PerArchiveLoadable {
  public static readonly index = IndexType.Maps;
  public static readonly gameval = "region";
  public readonly gameval = "region";

  private readonly regionId: RegionID;
  private readonly regionX: RegionX;
  private readonly regionY: RegionY;
  private readonly mapDefinition: MapDefinition;
  private readonly locationsDefinition: LocationsDefinition;

  // Mutable gameVal for differences task
  public gameVal?: string;

  constructor(
    regionX: RegionX,
    regionY: RegionY,
    mapDefinition: MapDefinition,
    locationsDefinition: LocationsDefinition
  ) {
    super();
    this.regionX = regionX;
    this.regionY = regionY;
    this.regionId = ((regionX << 8) | regionY) as RegionID;
    this.mapDefinition = mapDefinition;
    this.locationsDefinition = locationsDefinition;
  }

  // DecodableWithGameVal interface implementation
  public get id(): number {
    return this.regionId;
  }

  public getRegionId(): RegionID {
    return this.regionId;
  }

  public getRegionX(): RegionX {
    return this.regionX;
  }

  public getRegionY(): RegionY {
    return this.regionY;
  }

  public getMapDefinition(): MapDefinition {
    return this.mapDefinition;
  }

  public getLocationsDefinition(): LocationsDefinition {
    return this.locationsDefinition;
  }

  public getTiles(): Tile[][][] {
    return this.mapDefinition.getTiles();
  }

  public getLocations(): Location[] {
    return this.locationsDefinition.getLocations();
  }

  /**
   * Create a Region from map and location data.
   *
   * @param regionX The region X coordinate
   * @param regionY The region Y coordinate
   * @param mapData Raw map data (typically from archive "m{regionX}_{regionY}")
   * @param locationData Raw location data (typically from archive "l{regionX}_{regionY}")
   * @returns Decoded Region instance
   */
  public static create(
    regionX: RegionX,
    regionY: RegionY,
    mapData?: Buffer,
    locationData?: Buffer
  ): Region {
    // Decode map data if available
    let mapDefinition: MapDefinition;
    if (mapData) {
      const mapReader = new Reader(mapData);
      mapDefinition = MapDefinition.decode(mapReader, regionX, regionY);
    } else {
      mapDefinition = new MapDefinition(regionX, regionY);
    }

    // Decode location data if available (may require XTEA decryption)
    let locationsDefinition: LocationsDefinition;
    if (locationData) {
      locationsDefinition = LocationsDefinition.decode(
        locationData,
        regionX,
        regionY
      );
    } else {
      locationsDefinition = new LocationsDefinition(regionX, regionY);
    }

    return new Region(regionX, regionY, mapDefinition, locationsDefinition);
  }

  /**
   * Get the world coordinates for this region.
   */
  public getWorldBounds(): {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  } {
    const baseX = this.regionX * 64;
    const baseY = this.regionY * 64;

    return {
      minX: baseX,
      minY: baseY,
      maxX: baseX + 63,
      maxY: baseY + 63,
    };
  }

  /**
   * Check if a world position is within this region.
   */
  public containsWorldPosition(worldX: number, worldY: number): boolean {
    const bounds = this.getWorldBounds();
    return (
      worldX >= bounds.minX &&
      worldX <= bounds.maxX &&
      worldY >= bounds.minY &&
      worldY <= bounds.maxY
    );
  }

  /**
   * Convert world coordinates to local region coordinates.
   */
  public worldToLocal(
    worldX: number,
    worldY: number
  ): { localX: number; localY: number } {
    return {
      localX: worldX - this.regionX * 64,
      localY: worldY - this.regionY * 64,
    };
  }

  /**
   * Convert local region coordinates to world coordinates.
   */
  public localToWorld(
    localX: number,
    localY: number
  ): { worldX: number; worldY: number } {
    return {
      worldX: this.regionX * 64 + localX,
      worldY: this.regionY * 64 + localY,
    };
  }

  public getType(): IndexType {
    return Region.index;
  }
}
