import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { Area } from "../../../utils/cache2";
import { InfoboxLocation } from "../../templates";

const areaPageBuilder = (area: Area) => {
  const infoboxLocation = InfoboxLocation(area);

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxLocation.build(),
    new MediaWikiFile(`${area.name}.png`, {
      horizontalAlignment: "left",
      resizing: { width: 300 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(area.name, { bold: true }),
  ]);

  return builder;
};

export default areaPageBuilder;
