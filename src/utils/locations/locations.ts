import {
  CacheProvider,
  IndexType,
  Location,
  LocationsDefinition,
  Obj,
  ObjID,
} from "../cache2";
import { RegionMapper } from "../cache2/loaders/RegionMapper";

/**
 * Scenery location utilities - loads and caches spawn locations from cache archives
 *
 * Cache for scenery locations, indexed by scenery ID.
 */
let locationCache: Map<number, Location[]> | null = null;
let cachePromise: Promise<Map<number, Location[]>> | null = null;

/**
 * Reverse index mapping child object IDs to parent object IDs.
 * Built during loadAllLocations to enable finding parents that have a given child in multiChildren.
 */
let parentIndex: Map<ObjID, ObjID[]> | null = null;

/**
 * Builds a reverse index mapping child object IDs to their parent object IDs.
 * This enables efficient lookup of "which objects have this ID as a child?"
 *
 * @param cache The cache provider to use for loading objects
 * @returns Map of child ID to array of parent IDs that have it in multiChildren
 */
async function buildParentIndex(
  cache: CacheProvider
): Promise<Map<ObjID, ObjID[]>> {
  const reverseIndex = new Map<ObjID, ObjID[]>();

  try {
    const allObjects = await Obj.all(cache);

    for (const obj of allObjects) {
      if (obj.multiChildren && obj.multiChildren.length > 0) {
        for (const childId of obj.multiChildren) {
          if (childId > 0) {
            const parents = reverseIndex.get(childId) || [];
            parents.push(obj.id);
            reverseIndex.set(childId, parents);
          }
        }
      }
    }

    console.log(
      `[buildParentIndex] Built parent index for ${reverseIndex.size} child objects`
    );
  } catch (error) {
    console.error("Error building parent index:", error);
  }

  return reverseIndex;
}

/**
 * Loads all scenery locations from the cache once and builds an indexed map.
 * Subsequent calls return the cached data.
 *
 * @param cache The cache provider to use for loading region data
 * @returns Map of scenery ID to array of Location objects
 */
async function loadAllLocations(
  cache: CacheProvider
): Promise<Map<number, Location[]>> {
  // Return cached data if available
  if (locationCache) {
    return locationCache;
  }

  // If already loading, wait for that promise
  if (cachePromise) {
    return cachePromise;
  }

  // Start loading all locations
  cachePromise = (async () => {
    console.log(
      "[getSceneryLocations] Loading all scenery locations from cache..."
    );
    const startTime = Date.now();

    const locationMap = new Map<number, Location[]>();

    try {
      // Build parent index first
      parentIndex = await buildParentIndex(cache);

      const archiveIds = await cache.getArchives(IndexType.Maps);
      if (!archiveIds) {
        console.warn("No Maps index archives found");
        return locationMap;
      }

      console.log(
        `[getSceneryLocations] Processing ${archiveIds.length} archives...`
      );

      const results = await Promise.all(
        archiveIds.map(async (archiveId) => {
          try {
            const archive = await cache.getArchive(IndexType.Maps, archiveId);
            if (!archive) return [];

            const regionInfo = RegionMapper.getRegionFromArchiveId(
              archive.namehash
            );
            if (!regionInfo || regionInfo.type !== "locations") return [];

            const locationData = Buffer.from(archive.getFile(0).data);
            const locationsDef = LocationsDefinition.decode(
              locationData,
              regionInfo.regionX,
              regionInfo.regionY
            );

            return locationsDef.locations;
          } catch (error) {
            return [];
          }
        })
      );

      const allLocations = results.flat();

      for (const location of allLocations) {
        const sceneryId = location.getId();
        const existing = locationMap.get(sceneryId);
        if (existing) {
          existing.push(location);
        } else {
          locationMap.set(sceneryId, [location]);
        }
      }

      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(
        `[getSceneryLocations] Loaded ${allLocations.length} locations for ${locationMap.size} unique scenery objects in ${duration}ms`
      );
    } catch (error) {
      console.error("Error loading all scenery locations:", error);
    }

    return locationMap;
  })();

  locationCache = await cachePromise;
  return locationCache;
}

/**
 * Gets all spawn locations for a specific scenery object ID.
 * Uses cached data after the first load.
 *
 * For child objects (objects that appear in another object's multiChildren array),
 * this includes locations from parent objects, since the child can appear at those
 * locations when the parent's varbit/varp state changes.
 *
 * @param cache The cache provider to use for loading region data
 * @param sceneryId The scenery object ID to find spawns for
 * @returns Array of Location objects representing all spawns of the scenery
 */
export async function getSceneryLocations(
  cache: CacheProvider,
  sceneryId: ObjID
): Promise<Location[]> {
  const locationMap = await loadAllLocations(cache);
  const directLocations = locationMap.get(sceneryId) || [];

  // Check if this object is a child in any parent's multiChildren array
  const parentIds = parentIndex?.get(sceneryId) || [];

  // Collect locations from all parent objects
  const parentLocations: Location[] = [];
  for (const parentId of parentIds) {
    const locations = locationMap.get(parentId) || [];
    parentLocations.push(...locations);
  }

  // Combine and deduplicate locations by position
  const allLocations = [...directLocations, ...parentLocations];
  if (allLocations.length === 0) {
    return [];
  }

  const uniqueLocations = new Map<string, Location>();
  for (const location of allLocations) {
    const pos = location.getPosition();
    const key = `${pos.getX()},${pos.getY()},${pos.getZ()}`;
    if (!uniqueLocations.has(key)) {
      uniqueLocations.set(key, location);
    }
  }

  return Array.from(uniqueLocations.values());
}

/**
 * Gets parent objects that have the specified object ID in their multiChildren array.
 * Returns empty array if the object is not a child of any other object.
 *
 * @param cache The cache provider
 * @param childId The object ID to find parents for
 * @returns Array of parent Obj instances
 */
export async function getParentObjects(
  cache: CacheProvider,
  childId: ObjID
): Promise<Obj[]> {
  // Ensure parent index is built
  if (!parentIndex) {
    await loadAllLocations(cache);
  }

  const parentIds = parentIndex?.get(childId) || [];
  const parents: Obj[] = [];

  for (const parentId of parentIds) {
    try {
      const parent = await Obj.load(Promise.resolve(cache), parentId);
      if (parent) {
        parents.push(parent);
      }
    } catch (error) {
      console.warn(`Failed to load parent object ${parentId}:`, error);
    }
  }

  return parents;
}

/**
 * Pre-loads all scenery locations into cache.
 * Call this at the start of bulk operations for better performance.
 *
 * @param cache The cache provider to use for loading region data
 */
export async function preloadSceneryLocations(
  cache: CacheProvider
): Promise<void> {
  await loadAllLocations(cache);
}

/**
 * Clears the location cache and parent index.
 */
export function clearLocationCache(): void {
  locationCache = null;
  cachePromise = null;
  parentIndex = null;
}
