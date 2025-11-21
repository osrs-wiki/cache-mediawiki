import { Location } from "../cache2";

export type LocationGroup = {
  areaName: string;
  coordinates: Array<{ x: number; y: number; plane: number }>;
};

/**
 * Calculates the centroid (center point) of a group of locations.
 *
 * @param group Array of locations to calculate centroid for
 * @returns Object with x and y coordinates of the centroid
 */
function calculateCentroid(group: Location[]): { x: number; y: number } {
  const sum = group.reduce(
    (acc, loc) => {
      const pos = loc.getPosition();
      return {
        x: acc.x + pos.getX(),
        y: acc.y + pos.getY(),
      };
    },
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / group.length,
    y: sum.y / group.length,
  };
}

/**
 * Groups locations by proximity using a centroid-based clustering algorithm.
 * Locations within the distance threshold of the group's centroid will be grouped together.
 * The centroid is recalculated each time a new location is added to the group.
 *
 * @param locations Array of Location objects to group
 * @param distanceThreshold Maximum distance (in tiles) from the group centroid (default: 64)
 * @returns Array of location groups, where each group is an array of nearby locations
 */
export function groupLocationsByProximity(
  locations: Location[],
  distanceThreshold = 64
): Location[][] {
  if (locations.length === 0) return [];
  if (locations.length === 1) return [locations];

  // Copy locations array to avoid mutating the original
  const remaining = [...locations];
  const groups: Location[][] = [];

  while (remaining.length > 0) {
    // Start a new group with the first remaining location
    const firstLocation = remaining.shift();
    if (!firstLocation) break;

    const currentGroup: Location[] = [firstLocation];

    // Keep checking if any remaining locations are close to the group's centroid
    let foundNewMember = true;
    while (foundNewMember) {
      foundNewMember = false;

      // Calculate the centroid of the current group
      const centroid = calculateCentroid(currentGroup);

      for (let i = remaining.length - 1; i >= 0; i--) {
        const location = remaining[i];
        const pos = location.getPosition();

        // Check if this location is close to the group's centroid
        const distance = Math.sqrt(
          Math.pow(pos.getX() - centroid.x, 2) +
            Math.pow(pos.getY() - centroid.y, 2)
        );

        if (distance <= distanceThreshold) {
          // Add to current group and remove from remaining
          currentGroup.push(location);
          remaining.splice(i, 1);
          foundNewMember = true;
        }
      }
    }

    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Groups locations by area name, keeping proximity groups separate even if they share the same area.
 * Returns groups sorted alphabetically by area name.
 *
 * @param locationGroups Array of location groups from proximity grouping
 * @param areaNameMap Map of location coordinate keys ("x,y,plane") to area names
 * @returns Array of location groups with area names, sorted alphabetically
 */
export function groupLocationsByArea(
  locationGroups: Location[][],
  areaNameMap: Map<string, string>
): LocationGroup[] {
  const result: LocationGroup[] = [];

  for (const group of locationGroups) {
    const coordinates = group.map((loc) => {
      const pos = loc.getPosition();
      return {
        x: pos.getX(),
        y: pos.getY(),
        plane: pos.getZ(),
      };
    });

    // Use the first location's coordinates to look up the area name
    const firstLocation = group[0];
    const firstPos = firstLocation.getPosition();
    const coordKey = `${firstPos.getX()},${firstPos.getY()},${firstPos.getZ()}`;
    const areaName = areaNameMap.get(coordKey) || "?";

    // Keep each proximity group separate, even if they share an area name
    result.push({
      areaName,
      coordinates,
    });
  }

  // Sort alphabetically by area name
  result.sort((a, b) => a.areaName.localeCompare(b.areaName));

  return result;
}

/**
 * Merges location groups with identical area names into single groups.
 * This combines proximity groups that are in the same area into one entry.
 *
 * @param locationGroups Array of location groups with area names
 * @returns Array of merged location groups with combined coordinates
 */
export function mergeLocationGroupsByArea(
  locationGroups: LocationGroup[]
): LocationGroup[] {
  const mergedGroups = new Map<string, LocationGroup>();

  for (const group of locationGroups) {
    const existing = mergedGroups.get(group.areaName);
    if (existing) {
      // Merge coordinates into existing group
      existing.coordinates.push(...group.coordinates);
    } else {
      // Create new entry (deep copy to avoid mutating original)
      mergedGroups.set(group.areaName, {
        areaName: group.areaName,
        coordinates: [...group.coordinates],
      });
    }
  }

  // Convert back to array (maintains alphabetical order from input)
  return Array.from(mergedGroups.values());
}
