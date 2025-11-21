import { Area, CacheProvider, Location, Position, WorldMap } from "../cache2";

/**
 * Cached WorldMap instance to avoid reloading on every call
 */
let worldMapCache: WorldMap | null = null;
let worldMapPromise: Promise<WorldMap> | null = null;

/**
 * Loads the world map data once and caches it.
 *
 * @param cache The cache provider
 * @returns The loaded WorldMap instance
 */
async function loadWorldMap(cache: CacheProvider): Promise<WorldMap> {
  if (worldMapCache) {
    return worldMapCache;
  }

  if (worldMapPromise) {
    return worldMapPromise;
  }

  worldMapPromise = WorldMap.load(cache);
  worldMapCache = await worldMapPromise;
  return worldMapCache;
}

/**
 * Calculates the squared distance between two positions (avoids expensive sqrt).
 * Only compares x and y coordinates, ignoring z/plane differences.
 *
 * @param pos1 First position
 * @param pos2 Second position
 * @returns Squared distance between positions
 */
function distanceSquared(pos1: Position, pos2: Position): number {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return dx * dx + dy * dy;
}

/**
 * Finds the nearest area to a given position.
 *
 * @param cache The cache provider
 * @param position The position to find the nearest area for
 * @param excludeAreaId Optional area ID to exclude from search (useful for finding nearest area to an area)
 * @returns The nearest area with a valid name, or null if no area found
 */
export async function getNearestArea(
  cache: CacheProvider,
  position: Position,
  excludeAreaId?: number
): Promise<Area | null> {
  try {
    const worldMap = await loadWorldMap(cache);
    const elements = worldMap.getElements();

    if (elements.length === 0) {
      return null;
    }

    // Build a sorted list of all elements by distance
    const sortedElements = elements
      .map((element) => {
        const elementPos = element.getWorldPosition();
        const distance = distanceSquared(position, elementPos);
        return { element, distance };
      })
      .filter(({ element }) => {
        // Skip excluded area if specified
        return (
          excludeAreaId === undefined ||
          element.areaDefinitionId !== excludeAreaId
        );
      })
      .sort((a, b) => a.distance - b.distance);

    // Try to load areas in order of distance until we find one with a valid name
    for (const { element } of sortedElements) {
      const area = await Area.load(cache, element.areaDefinitionId);
      if (area && area.name) {
        return area;
      }
    }

    return null;
  } catch (error) {
    console.debug(
      `Failed to get nearest area for position ${position.x},${position.y}:`,
      error
    );
    return null;
  }
}

/**
 * Finds the area name for a location by finding the closest world map element.
 *
 * @param cache The cache provider
 * @param location The location to find the area for
 * @returns The area name, or null if no nearby element found or area couldn't be loaded
 */
export async function getAreaNameForLocation(
  cache: CacheProvider,
  location: Location
): Promise<string | null> {
  const area = await getNearestArea(cache, location.getPosition());
  return area?.name ?? null;
}

/**
 * Finds area names for multiple locations efficiently by batching area loads.
 *
 * @param cache The cache provider
 * @param locations Array of locations to find areas for
 * @returns Map of location index to area name
 */
export async function getAreaNamesForLocations(
  cache: CacheProvider,
  locations: Location[]
): Promise<Map<number, string>> {
  const areaNames = new Map<number, string>();

  if (locations.length === 0) {
    return areaNames;
  }

  try {
    const worldMap = await loadWorldMap(cache);
    const elements = worldMap.getElements();

    if (elements.length === 0) {
      return areaNames;
    }

    // Find closest element for each location
    const areaIds = new Set<number>();
    const locationToAreaId = new Map<number, number>();

    for (let i = 0; i < locations.length; i++) {
      const locationPos = locations[i].getPosition();

      let closestElement = elements[0];
      let closestDistance = distanceSquared(
        locationPos,
        closestElement.getWorldPosition()
      );

      for (let j = 1; j < elements.length; j++) {
        const element = elements[j];
        const elementPos = element.getWorldPosition();
        const distance = distanceSquared(locationPos, elementPos);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestElement = element;
        }
      }

      const areaId = closestElement.areaDefinitionId;
      areaIds.add(areaId);
      locationToAreaId.set(i, areaId);
    }

    // Batch load all unique areas
    const areaCache = new Map<number, string>();
    await Promise.all(
      Array.from(areaIds).map(async (areaId) => {
        try {
          const area = await Area.load(cache, areaId);
          if (area && area.name) {
            areaCache.set(areaId, area.name);
          }
        } catch (error) {
          console.debug(`Failed to load area ${areaId}:`, error);
        }
      })
    );

    // Map locations to area names
    for (let i = 0; i < locations.length; i++) {
      const areaId = locationToAreaId.get(i);
      if (areaId !== undefined) {
        const areaName = areaCache.get(areaId);
        if (areaName) {
          areaNames.set(i, areaName);
        }
      }
    }
  } catch (error) {
    console.debug("Failed to get area names for locations:", error);
  }

  return areaNames;
}

/**
 * Clears the world map cache.
 */
export function clearWorldMapCache(): void {
  worldMapCache = null;
  worldMapPromise = null;
}
