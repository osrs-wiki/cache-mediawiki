import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "../../../context";
import { Area } from "../../../utils/cache2";
import { InfoboxLocation } from "../../templates";

const areaPageBuilder = (area: Area) => {
  const infoboxLocation = InfoboxLocation(area);

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
