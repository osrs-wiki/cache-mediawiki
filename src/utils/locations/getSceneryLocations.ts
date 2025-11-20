import {
  CacheProvider,
  IndexType,
  Location,
  LocationsDefinition,
} from "../cache2";
import { RegionMapper } from "../cache2/loaders/RegionMapper";

/**
 * Aggregates all spawn locations for a specific scenery object ID across all regions.
 *
 * @param cache The cache provider to use for loading region data
 * @param sceneryId The scenery object ID to find spawns for
 * @returns Array of Location objects representing all spawns of the scenery
 */
export async function getSceneryLocations(
  cache: CacheProvider,
  sceneryId: number
): Promise<Location[]> {
  console.debug(`[getSceneryLocations] Starting for scenery ID ${sceneryId}`);
  const locations: Location[] = [];

  try {
    // Get all Maps index archives
    console.debug(`[getSceneryLocations] Calling getArchives(Maps)...`);
    const archiveIds = await cache.getArchives(IndexType.Maps);
    console.debug(
      `[getSceneryLocations] Got ${archiveIds?.length ?? 0} archive IDs`
    );
    if (!archiveIds) {
      console.warn("No Maps index archives found");
      return locations;
    }

    // Process all archives in parallel for performance
    await Promise.all(
      archiveIds.map(async (archiveId) => {
        try {
          const archive = await cache.getArchive(IndexType.Maps, archiveId);
          if (!archive) return;

          // Check if this is a locations archive
          const regionInfo = RegionMapper.getRegionFromArchiveId(
            archive.namehash
          );
          if (!regionInfo || regionInfo.type !== "locations") return;

          // Decode locations for this region
          const locationData = Buffer.from(archive.getFile(0).data);
          const locationsDef = LocationsDefinition.decode(
            locationData,
            regionInfo.regionX,
            regionInfo.regionY
          );

          // Filter for matching scenery ID
          const matchingLocations = locationsDef.locations.filter(
            (loc) => loc.getId() === sceneryId
          );

          locations.push(...matchingLocations);
        } catch (error) {
          // Region might not be loadable (missing XTEA key, corrupted data, etc.)
          // Silently continue processing other regions - these errors are expected
          // for regions with missing XTEA keys or corrupted data
        }
      })
    );
  } catch (error) {
    console.error("Error aggregating scenery locations:", error);
  }

  return locations;
}
