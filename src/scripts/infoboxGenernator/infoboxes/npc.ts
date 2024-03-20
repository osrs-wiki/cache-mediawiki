import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxNpc } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import Context from "../../../context";
import { CacheProvider, NPC } from "../../../utils/cache2";

const npcInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const npc = await NPC.load(cache, id);
    buildNpcInfobox(npc);
  } catch (e) {
    console.error(`Error generating infobox for npc ${id}: `, e);
  }
};

export const buildNpcInfobox = async (npc: NPC) => {
  try {
    const infoboxNpc = new InfoboxTemplate<InfoboxNpc>("NPC", {
      name: npc.name as string,
      image: new MediaWikiFile(`${npc.name}.png`, {
        resizing: { width: 130 },
      }),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : undefined,
      update: Context.update,
      members: true,
      level: npc.combatLevel.toString(),
      quest: "No",
      options: npc.actions,
      map: "No",
      examine: "",
      id: npc.id.toString(),
    });

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("Stub"),
      infoboxNpc.build(),
      new MediaWikiFile(`${npc.name} chathead.png`, {
        horizontalAlignment: "left",
      }),
      new MediaWikiBreak(),
    ]);

    await mkdir("./out/infobox/npc", { recursive: true });
    await writeFile(`./out/infobox/npc/${npc.id}.txt`, builder.build());
  } catch (e) {
    console.error("Error building npc infobox", e);
  }
};

export default npcInfoboxGenerator;
