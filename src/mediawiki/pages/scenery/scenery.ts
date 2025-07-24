import {
  InfoboxTemplate,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxScenery } from "./scenery.types";

import Context from "@/context";
import { Obj } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export const sceneryPageBuilder = (scenery: Obj) => {
  const cleanName = stripHtmlTags(scenery.name);
  const infoboxscenery = new InfoboxTemplate<InfoboxScenery>("Scenery", {
    name: cleanName,
    image: new MediaWikiFile(`${cleanName}.png`),
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
    new MediaWikiText(cleanName, { bold: true }),
  ]);

  return builder;
};

export default sceneryPageBuilder;
