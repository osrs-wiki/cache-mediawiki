import {
  MediaWikiBuilder,
  MediaWikiBreak,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
  MediaWikiHeader,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxScenery } from "./scenery.types";
import { getObjectLocLines } from "./scenery.utils";
import { InfoboxTemplate, MapTemplate } from "../../templates";

import Context from "@/context";
import { CacheProvider, Location, Obj } from "@/utils/cache2";
import {
  getSceneryLocations,
  groupLocationsByProximity,
  groupLocationsByArea,
  getAreaNamesForLocations,
  mergeLocationGroupsByArea,
} from "@/utils/locations";
import { stripHtmlTags } from "@/utils/string";

export const sceneryPageBuilder = async (
  scenery: Obj,
  cache?: Promise<CacheProvider>
) => {
  const cleanName = stripHtmlTags(scenery.name);

  let locations: Location[] = [];

  if (cache) {
    try {
      locations = await getSceneryLocations(await cache, scenery.id);
    } catch (error) {
      // Silently fail if we can't load locations (missing XTEA keys, network errors, etc.)
      console.debug(
        `Could not load locations for scenery ${scenery.id}:`,
        error
      );
    }
  }

  // Get location name if there's a single location (needed before building params)
  let locationName: string | undefined;
  if (locations.length === 1 && cache) {
    try {
      const areaNameMap = await getAreaNamesForLocations(await cache, [
        locations[0],
      ]);
      const pos = locations[0].getPosition();
      const coordKey = `${pos.x},${pos.y},${pos.z}`;
      locationName = areaNameMap.get(coordKey);
    } catch (error) {
      console.debug("Failed to load area name for single location:", error);
    }
  }

  // Build infobox params with correct field ordering
  const infoboxParams: InfoboxScenery = {
    name: cleanName,
    image: new MediaWikiFile(`${cleanName}.png`),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : "",
    update: Context.update,
    members: true,
    quest: "No",
    ...(locationName && { location: new MediaWikiLink(locationName) }),
    options: scenery.actions,
    examine: Context.examines?.scenery
      ? Context.examines.scenery[scenery.id]
      : "",
    id: `${Context.beta ? "beta" : ""}${scenery.id.toString()}`,
  };

  // Add map parameter for single location
  if (locations.length === 1) {
    const location = locations[0];
    const pos = location.getPosition();
    infoboxParams.map = new MapTemplate({
      name: cleanName,
      coordinates: {
        x: pos.getX(),
        y: pos.getY(),
        plane: pos.getZ(),
      },
      mapID: -1,
      mtype: "pin",
    }).build();
  }

  const infoboxscenery = new InfoboxTemplate<InfoboxScenery>(
    "Scenery",
    infoboxParams
  );

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([
    infoboxscenery.build(),
    new MediaWikiText(cleanName, { bold: true }),
    new MediaWikiText(" is a scenery object."),
  ]);

  // Add locations section for multiple spawns
  if (locations.length > 1) {
    builder.addContents([
      new MediaWikiBreak(),
      new MediaWikiBreak(),
      new MediaWikiHeader("Locations", 2),
      new MediaWikiBreak(),
      new MediaWikiTemplate("ObjectTableHead"),
    ]);

    // Group locations by proximity
    const proximityGroups = groupLocationsByProximity(locations);

    // Get area names for all locations
    let areaNameMap = new Map<string, string>();
    if (cache) {
      try {
        areaNameMap = await getAreaNamesForLocations(await cache, locations);
      } catch (error) {
        console.debug("Failed to load area names:", error);
      }
    }

    // Group by area and sort alphabetically
    const locationGroups = groupLocationsByArea(proximityGroups, areaNameMap);

    // Combine groups with identical area names (merge proximity groups from same area)
    const mergedGroups = mergeLocationGroupsByArea(locationGroups);

    // Generate ObjectLocLine templates
    const objectLocLines = getObjectLocLines(cleanName, mergedGroups);
    builder.addContents(objectLocLines);

    builder.addContent(new MediaWikiTemplate("ObjectTableBottom"));
  }

  return builder;
};

export default sceneryPageBuilder;
