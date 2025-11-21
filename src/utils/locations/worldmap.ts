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
  try {
    const worldMap = await loadWorldMap(cache);
    const elements = worldMap.getElements();

    if (elements.length === 0) {
      return null;
    }

    const locationPos = location.getPosition();

    // Find the closest world map element
    let closestElement = elements[0];
    let closestDistance = distanceSquared(
      locationPos,
      closestElement.getWorldPosition()
    );

    for (let i = 1; i < elements.length; i++) {
      const element = elements[i];
      const elementPos = element.getWorldPosition();
      const distance = distanceSquared(locationPos, elementPos);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = element;
      }
    }

    // Load the area definition
    const area = await Area.load(cache, closestElement.areaDefinitionId);
    if (!area) {
      return null;
    }

    return area.name;
  } catch (error) {
    console.debug(
      `Failed to get area name for location at ${location.getPosition().x},${
        location.getPosition().y
      }:`,
      error
    );
    return null;
  }
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
