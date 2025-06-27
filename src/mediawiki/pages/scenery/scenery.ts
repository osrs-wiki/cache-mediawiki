import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxScenery } from "./scenery.types";

import Context from "@/context";
import { Obj } from "@/utils/cache2";

export const sceneryPageBuilder = (scenery: Obj) => {
  const infoboxscenery = new InfoboxTemplate<InfoboxScenery>("Scenery", {
    name: scenery.name as string,
    image: new MediaWikiFile(`${scenery.name}.png`),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true,
    quest: "No",
    options: scenery.actions,
    examine: Context.examines?.scenery
      ? Context.examines.scenery[scenery.id]
      : "",
    map: "No",
    id: `${Context.beta ? "beta" : ""}${scenery.id.toString()}`,
  });

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxscenery.build(),
    new MediaWikiFile(`${scenery.name} detail.png`, {
      horizontalAlignment: "left",
      resizing: { width: 130 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(scenery.name, { bold: true }),
  ]);

  return builder;
};

export default sceneryPageBuilder;
