import {
  MediaWikiBuilder,
  MediaWikiBreak,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
  MediaWikiHeader,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxScenery } from "./scenery.types";
import {
  InfoboxTemplate,
  MapTemplate,
  ObjectLocLineTemplate,
} from "../../templates";

import Context from "@/context";
import { CacheProvider, Location, Obj } from "@/utils/cache2";
import {
  getSceneryLocations,
  groupLocationsByProximity,
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

  // Build infobox params
  const infoboxParams: InfoboxScenery = {
    name: cleanName,
    image: new MediaWikiFile(`${cleanName}.png`),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : "",
    update: Context.update,
    members: true,
    quest: "No",
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
    const locationGroups = groupLocationsByProximity(locations);

    // Create an ObjectLocLine for each group
    for (const group of locationGroups) {
      const coordinates = group.map((loc) => {
        const pos = loc.getPosition();
        return {
          x: pos.getX(),
          y: pos.getY(),
          plane: pos.getZ(),
        };
      });

      builder.addContent(
        new ObjectLocLineTemplate({
          name: cleanName,
          location: new MediaWikiText("?"),
          members: true,
          coordinates,
          mapID: -1,
          mtype: "pin",
        }).build()
      );
    }

    builder.addContent(new MediaWikiTemplate("ObjectTableBottom"));
  }

  return builder;
};

export default sceneryPageBuilder;
