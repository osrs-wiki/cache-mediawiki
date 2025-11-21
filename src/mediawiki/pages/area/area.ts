import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "../../../context";
import { Area, CacheProvider, WorldMap } from "../../../utils/cache2";
import { InfoboxLocation, MapTemplate } from "../../templates";

const areaPageBuilder = async (area: Area, cache?: Promise<CacheProvider>) => {
  // Find the world map element for this area
  let mapTemplateStr: string | undefined;
  if (cache) {
    try {
      const worldMap = await WorldMap.load(await cache);
      const element = worldMap
        .getElements()
        .find((el) => el.areaDefinitionId === area.id);

      if (element) {
        const pos = element.getWorldPosition();
        const mapTemplate = new MapTemplate({
          name: area.name,
          coordinates: {
            x: pos.getX(),
            y: pos.getY(),
            plane: pos.getZ(),
          },
          mapID: -1,
          mtype: "pin",
        });
        mapTemplateStr = mapTemplate.build().build();
      }
    } catch (error) {
      console.debug(
        `Failed to load world map element for area ${area.id}:`,
        error
      );
    }
  }

  const infoboxLocation = InfoboxLocation(area, mapTemplateStr);

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
