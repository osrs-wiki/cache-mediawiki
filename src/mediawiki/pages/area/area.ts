import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "../../../context";
import { Area, CacheProvider, WorldMap } from "../../../utils/cache2";
import { InfoboxLocation, MapTemplate } from "../../templates";

const areaPageBuilder = async (area: Area, cache?: Promise<CacheProvider>) => {
  // Find the world map element for this area
  let mapTemplate: MediaWikiTemplate | undefined;
  const nearestAreaName: string | null = null;

  if (cache) {
    try {
      const cacheProvider = await cache;
      const worldMap = await WorldMap.load(cacheProvider);
      const element = worldMap
        .getElements()
        .find((el) => el.areaDefinitionId === area.id);

      if (element) {
        const pos = element.getWorldPosition();
        const mapTemplateObj = new MapTemplate({
          name: area.name,
          coordinates: {
            x: pos.getX(),
            y: pos.getY(),
            plane: pos.getZ(),
          },
          mapID: -1,
          mtype: "pin",
        });
        mapTemplate = mapTemplateObj.build();

        // Find nearest area for location parameter
        // TODO: Area mapping needs to consider grouping and not just the nearest area.
        // It also needs to support mapping dungeons to their overworld areas.
        /*const nearestArea = await getNearestArea(cacheProvider, pos, area.id);
        if (nearestArea) {
          nearestAreaName = nearestArea.name;
        }*/
      }
    } catch (error) {
      console.debug(
        `Failed to load world map element for area ${area.id}:`,
        error
      );
    }
  }

  const infoboxLocation = InfoboxLocation(
    area,
    mapTemplate,
    nearestAreaName ? new MediaWikiLink(nearestAreaName) : undefined
  );

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([
    infoboxLocation.build(),
    new MediaWikiFile(`${area.name}.png`, {
      horizontalAlignment: "left",
      resizing: { width: 300 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(area.name, { bold: true }),
    new MediaWikiText(" is an area."),
  ]);

  return builder;
};

export default areaPageBuilder;
