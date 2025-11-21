import {
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { ObjectLocLineTemplate } from "../../templates";

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
