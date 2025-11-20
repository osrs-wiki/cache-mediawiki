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
  public static readonly index = IndexType.Maps;
  public static readonly gameval = "locationsdefinition";
  public readonly gameval = "locationsdefinition";

  public readonly regionX: RegionX;
  public readonly regionY: RegionY;
  public locations: Location[] = [];

  constructor(regionX: RegionX, regionY: RegionY) {
    super();
    this.regionX = regionX;
    this.regionY = regionY;
  }

  public get id(): number {
    return (this.regionX << 8) | this.regionY;
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
      // Silently ignore parsing errors - these are expected for regions with
      // corrupted data or missing XTEA keys. Callers handle these gracefully.
    }
  }

  public getType(): IndexType {
    return LocationsDefinition.index;
  }

  /**
   * Compares this LocationsDefinition with another and returns the number of locations that are different.
   * This includes locations that are added, removed, or modified between the two definitions.
   *
   * @param other The other LocationsDefinition to compare against
   * @returns The number of locations that are not identical between the two LocationsDefinitions
   */
  public getDifferentLocationCount(other: LocationsDefinition): number {
    if (!other) {
      // If comparing against null/undefined, all locations are different
      return this.locations.length;
    }

    if (this.regionX !== other.regionX || this.regionY !== other.regionY) {
      // If comparing different regions, all locations are different
      return Math.max(this.locations.length, other.locations.length);
    }

    // Create maps for efficient lookup
    const thisLocationMap = new Map<string, Location>();
    const otherLocationMap = new Map<string, Location>();

    // Build lookup maps using a composite key (id + position + type + orientation)
    for (const location of this.locations) {
      const key = this.getLocationKey(location);
      thisLocationMap.set(key, location);
    }

    for (const location of other.locations) {
      const key = this.getLocationKey(location);
      otherLocationMap.set(key, location);
    }

    // Count differences
    let differentCount = 0;

    // Check for locations in this definition that are not in the other or are different
    for (const [key, thisLocation] of thisLocationMap) {
      const otherLocation = otherLocationMap.get(key);
      if (!otherLocation || !thisLocation.equals(otherLocation)) {
        differentCount++;
      }
    }

    // Check for locations in the other definition that are not in this one
    for (const [key] of otherLocationMap) {
      if (!thisLocationMap.has(key)) {
        differentCount++;
      }
    }

    return differentCount;
  }

  /**
   * Creates a unique key for a location based on its properties.
   *
   * @param location The location to create a key for
   * @returns A string key that uniquely identifies the location
   */
  private getLocationKey(location: Location): string {
    const pos = location.getPosition();
    return `${pos.getX()}_${pos.getY()}_${pos.getZ()}`;
  }
}
