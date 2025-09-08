import { hash } from "../Cache";
import { RegionX, RegionY, RegionID } from "../types";

export interface RegionInfo {
  regionX: RegionX;
  regionY: RegionY;
  regionId: RegionID;
  type: "map" | "locations";
  archiveName: string;
}

/**
 * Maps archive IDs to region information by pre-computing all possible region name hashes.
 * Uses lazy initialization to avoid expensive computation when not needed.
 */
export class RegionMapper {
  private static archiveToRegionMap = new Map<number, RegionInfo>();
  private static initialized = false;

  /**
   * Get region information from archive ID.
   * Initializes the mapping lazily on first access.
   */
  public static getRegionFromArchiveId(archiveId: number): RegionInfo | null {
    if (!this.initialized) {
      this.initialize();
    }
    return this.archiveToRegionMap.get(archiveId) || null;
  }

  /**
   * Check if an archive ID corresponds to a region archive.
   * Initializes the mapping lazily on first access.
   */
  public static isRegionArchive(archiveId: number): boolean {
    if (!this.initialized) {
      this.initialize();
    }
    return this.archiveToRegionMap.has(archiveId);
  }

  /**
   * Get all known region archive IDs.
   * Initializes the mapping lazily on first access.
   */
  public static getAllRegionArchiveIds(): number[] {
    if (!this.initialized) {
      this.initialize();
    }
    return Array.from(this.archiveToRegionMap.keys());
  }

  /**
   * Reset the mapper (useful for testing)
   */
  public static reset(): void {
    this.archiveToRegionMap.clear();
    this.initialized = false;
  }

  /**
   * Pre-compute all possible region archive ID mappings.
   * Private - called automatically when needed via lazy initialization.
   */
  private static initialize(): void {
    if (this.initialized) {
      return;
    }

    console.log("Building region archive ID mapping...");
    const startTime = Date.now();

    // Hash all possible region combinations (0-255 for both X and Y)
    for (let x = 0; x <= 255; x++) {
      for (let y = 0; y <= 255; y++) {
        const regionX = x as RegionX;
        const regionY = y as RegionY;
        const regionId = ((x << 8) | y) as RegionID;

        // Map archives: "m{x}_{y}"
        const mapArchiveName = `m${x}_${y}`;
        const mapArchiveId = hash(mapArchiveName);
        this.archiveToRegionMap.set(mapArchiveId, {
          regionX,
          regionY,
          regionId,
          type: "map",
          archiveName: mapArchiveName,
        });

        // Location archives: "l{x}_{y}"
        const locationsArchiveName = `l${x}_${y}`;
        const locationsArchiveId = hash(locationsArchiveName);
        this.archiveToRegionMap.set(locationsArchiveId, {
          regionX,
          regionY,
          regionId,
          type: "locations",
          archiveName: locationsArchiveName,
        });
      }
    }

    this.initialized = true;
    const endTime = Date.now();
    console.log(
      `Built mapping for ${this.archiveToRegionMap.size} region archives in ${
        endTime - startTime
      }ms`
    );
  }
}
