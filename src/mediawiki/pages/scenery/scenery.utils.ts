import {
  MediaWikiBreak,
  MediaWikiContent,
  MediaWikiHeader,
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { ObjectLocLineTemplate } from "../../templates";

import { CacheProvider, Location } from "@/utils/cache2";
import {
  groupLocationsByProximity,
  groupLocationsByArea,
  getAreaNamesForLocations,
  mergeLocationGroupsByArea,
} from "@/utils/locations";
import { LocationGroup } from "@/utils/locations/grouping";

/**
 * Generates ObjectLocLine templates for location groups.
 *
 * @param cleanName The display name of the scenery object
 * @param locationGroups Array of location groups organized by area
 * @returns Array of MediaWiki templates for each location group
 */
export function getObjectLocLines(
  cleanName: string,
  locationGroups: LocationGroup[]
): MediaWikiTemplate[] {
  return locationGroups.map((group) =>
    new ObjectLocLineTemplate({
      name: cleanName,
      location:
        group.areaName !== "?"
          ? new MediaWikiLink(group.areaName)
          : new MediaWikiText("?"),
      members: true,
      coordinates: group.coordinates,
      mapID: -1,
      mtype: "pin",
    }).build()
  );
}

/**
 * Builds the locations section for a scenery object with multiple spawns.
 *
 * @param locations Array of location data for the scenery object
 * @param cleanName The display name of the scenery object
 * @param cache The cache provider for loading area names
 * @returns Array of MediaWiki content elements for the locations section
 */
export async function buildLocationsSection(
  locations: Location[],
  cleanName: string,
  cache: Promise<CacheProvider>
): Promise<MediaWikiContent[]> {
  // Only build locations section for multiple spawns
  if (locations.length <= 1) {
    return [];
  }

  const content: MediaWikiContent[] = [
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Locations", 2),
    new MediaWikiBreak(),
    new MediaWikiTemplate("ObjectTableHead"),
  ];

  // Group locations by proximity
  const proximityGroups = groupLocationsByProximity(locations);

  // Get area names for all locations
  let areaNameMap = new Map<string, string>();
  try {
    areaNameMap = await getAreaNamesForLocations(await cache, locations);
  } catch (error) {
    console.debug("Failed to load area names:", error);
  }

  // Group by area and sort alphabetically
  const locationGroups = groupLocationsByArea(proximityGroups, areaNameMap);

  // Combine groups with identical area names (merge proximity groups from same area)
  const mergedGroups = mergeLocationGroupsByArea(locationGroups);

  // Generate ObjectLocLine templates
  const objectLocLines = getObjectLocLines(cleanName, mergedGroups);
  content.push(...objectLocLines);

  content.push(new MediaWikiTemplate("ObjectTableBottom"));

  return content;
}
