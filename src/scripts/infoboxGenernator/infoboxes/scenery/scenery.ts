import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { InfoboxScenery } from "./scenery.types";
import Context from "../../../../context";
import { Obj, CacheProvider } from "../../../../utils/cache2";
import { formatFileName } from "../../../../utils/files";

const sceneryInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const scenery = await Obj.load(cache, id);

    buildsceneryInfobox(scenery);
  } catch (e) {
    console.error(`Error generating infobox for scenery ${id}: `, e);
  }
};

export const buildsceneryInfobox = async (scenery: Obj) => {
  try {
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
      id: scenery.id.toString(),
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

    await mkdir("./out/infobox/scenery", { recursive: true });
    writeFile(`./out/infobox/scenery/${scenery.id}.txt`, builder.build());

    await mkdir("./out/infobox_named/scenery", { recursive: true });
    writeFile(
      formatFileName(`./out/infobox_named/scenery/${scenery.name}.txt`),
      builder.build()
    );
    return builder;
  } catch (e) {
    console.error("Error building scenery infobox: ", e);
  }
};

export default sceneryInfoboxGenerator;
