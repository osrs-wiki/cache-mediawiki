import {
  MediaWikiBuilder,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { buildLocationsSection } from "./scenery.utils";
import {
  InfoboxScenery,
  InfoboxSceneryOptions,
  MapTemplate,
} from "../../templates";

import Context from "@/context";
import { CacheProvider, Location, Obj } from "@/utils/cache2";
import {
  getSceneryLocations,
  getAreaNamesForLocations,
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

  // Prepare infobox options for single location
  let infoboxOptions: InfoboxSceneryOptions | undefined;
  if (locations.length === 1 && cache) {
    const location = locations[0];
    const pos = location.getPosition();

    try {
      const areaNameMap = await getAreaNamesForLocations(await cache, [
        locations[0],
      ]);
      const coordKey = `${pos.x},${pos.y},${pos.z}`;
      const locationName = areaNameMap.get(coordKey);

      infoboxOptions = {
        location: locationName,
        map: new MapTemplate({
          name: cleanName,
          coordinates: {
            x: pos.getX(),
            y: pos.getY(),
            plane: pos.getZ(),
          },
          mapID: -1,
          mtype: "pin",
        }).build(),
      };
    } catch (error) {
      console.debug("Failed to load area name for single location:", error);
    }
  }

  // Create the infobox template
  const infoboxscenery = InfoboxScenery(scenery, infoboxOptions);

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
  if (cache && locations.length > 1) {
    const locationsContent = await buildLocationsSection(
      scenery.id,
      cleanName,
      cache
    );
    builder.addContents(locationsContent);
  }

  return builder;
};

export default sceneryPageBuilder;
