import { Location } from "./Location";
import { Position } from "./Position";
import { PerArchiveLoadable } from "../Loadable";
import { Reader } from "../Reader";
import {
  RegionX,
  RegionY,
  IndexType,
  LocationID,
  LocationType,
  LocationOrientation,
  WorldX,
  WorldY,
} from "../types";

/**
 * Represents location/object data for a region from OSRS cache.
 * This data is typically encrypted with XTEA keys.
 * Based on RuneLite's LocationsLoader.
 */
export class LocationsDefinition extends PerArchiveLoadable {
  public static readonly INDEX_TYPE = IndexType.Maps;

  private readonly regionX: RegionX;
  private readonly regionY: RegionY;
  private locations: Location[] = [];

  constructor(regionX: RegionX, regionY: RegionY) {
    super();
    this.regionX = regionX;
    this.regionY = regionY;
  }

  public getRegionX(): RegionX {
    return this.regionX;
  }

  public getRegionY(): RegionY {
    return this.regionY;
  }

  public getLocations(): Location[] {
    return this.locations;
  }

  /**
   * Decode locations data from an encrypted archive.
   * Requires XTEA keys to decrypt the data.
   */
  public static decode(
    data: Buffer,
    regionX: RegionX,
    regionY: RegionY
  ): LocationsDefinition {
    const locationsDef = new LocationsDefinition(regionX, regionY);

    try {
      const reader = new Reader(data);
      locationsDef.parseLocations(reader);
    } catch (error) {
      console.warn(
        `Failed to decode locations for region ${regionX},${regionY}:`,
        error
      );
    }

    return locationsDef;
  }

  private parseLocations(reader: Reader): void {
    try {
      let objectId = -1;
      let idOffset;

      while ((idOffset = reader.u8o16()) !== 0) {
        objectId += idOffset;

        let position = 0;
        let positionOffset;

        while ((positionOffset = reader.u8o16()) !== 0) {
          position += positionOffset - 1;

          const localY = position & 0x3f;
          const localX = (position >> 6) & 0x3f;
          const z = (position >> 12) & 0x3;

          const attributes = reader.u8();
          const type = (attributes >> 2) & 0x1f;
          const rotation = attributes & 0x3;

          // Convert local coordinates to world coordinates
          const worldX = this.regionX * 64 + localX;
          const worldY = this.regionY * 64 + localY;

          const location = new Location(
            objectId as LocationID,
            type as LocationType,
            rotation as LocationOrientation,
            new Position(worldX as WorldX, worldY as WorldY, z)
          );

          this.locations.push(location);
        }
      }
    } catch (error) {
      console.warn(`Error parsing locations data:`, error);
    }
  }

  public getType(): IndexType {
    return LocationsDefinition.INDEX_TYPE;
  }
}
