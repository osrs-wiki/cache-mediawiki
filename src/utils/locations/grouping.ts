import { Location } from "../cache2";

/**
 * Groups locations by proximity using a clustering algorithm.
 * Locations within the distance threshold of each other will be grouped together.
 *
 * @param locations Array of Location objects to group
 * @param distanceThreshold Maximum distance (in tiles) between locations in the same group (default: 64)
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

    // Keep checking if any remaining locations are close to any location in the current group
    let foundNewMember = true;
    while (foundNewMember) {
      foundNewMember = false;

      for (let i = remaining.length - 1; i >= 0; i--) {
        const location = remaining[i];
        const pos = location.getPosition();

        // Check if this location is close to any location in the current group
        const isNearby = currentGroup.some((groupLocation) => {
          const groupPos = groupLocation.getPosition();
          const distance = Math.sqrt(
            Math.pow(pos.getX() - groupPos.getX(), 2) +
              Math.pow(pos.getY() - groupPos.getY(), 2)
          );
          return distance <= distanceThreshold;
        });

        if (isNearby) {
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
