import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxNpc } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { InfoboxMonster } from "./npcs.types";
import Context from "../../../../context";
import { CacheProvider, NPC } from "../../../../utils/cache2";
import { formatFileName } from "../../../../utils/files";

const npcInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const npc = await NPC.load(cache, id);
    if (npc.combatLevel > 0) {
      buildMonsterInfobox(npc);
    } else {
      buildNpcInfobox(npc);
    }
  } catch (e) {
    console.error(`Error generating infobox for npc ${id}: `, e);
  }
};

export const buildNpcInfobox = async (npc: NPC) => {
  try {
    const infoboxNpc = new InfoboxTemplate<InfoboxNpc>("NPC", {
      name: npc.name as string,
      image: new MediaWikiFile(`${npc.name}.png`, {
        resizing: { width: 120 },
      }),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : undefined,
      update: Context.update,
      members: true,
      level: npc.combatLevel > 0 ? npc.combatLevel.toString() : undefined,
      race: "[[Human]]",
      location: "",
      gender: "Male",
      options: npc.actions,
      map: "No",
      examine: Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
      id: npc.id.toString(),
    });

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("New Content"),
      infoboxNpc.build(),
      new MediaWikiFile(`${npc.name} chathead.png`, {
        horizontalAlignment: "left",
      }),
      new MediaWikiBreak(),
      new MediaWikiText(npc.name, { bold: true }),
    ]);

    await mkdir("./out/infobox/npc", { recursive: true });
    await writeFile(`./out/infobox/npc/${npc.id}.txt`, builder.build());

    await mkdir("./out/infobox_named/npc", { recursive: true });
    await writeFile(
      formatFileName(`./out/infobox_named/npc/${npc.name}.txt`),
      builder.build()
    );
    return builder;
  } catch (e) {
    console.error("Error building npc infobox", e);
  }
};

export const buildMonsterInfobox = async (npc: NPC) => {
  try {
    const infoboxMonster = new InfoboxTemplate<InfoboxMonster>("Monster", {
      name: npc.name as string,
      image: new MediaWikiFile(`${npc.name}.png`, {
        resizing: { width: 120 },
      }),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : undefined,
      update: Context.update,
      members: true,
      combat: npc.combatLevel,
      size: npc.size,
      hitpoints: npc.hitpoints,
      att: npc.attack,
      def: npc.defence,
      mage: npc.magic,
      range: npc.ranged,
      examine: Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
      id: `beta${npc.id.toString()}`,
    });

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("New Content"),
      infoboxMonster.build(),
      new MediaWikiText(npc.name, { bold: true }),
    ]);

    await mkdir("./out/infobox/npc", { recursive: true });
    await writeFile(`./out/infobox/npc/${npc.id}.txt`, builder.build());

    await mkdir("./out/infobox_named/npc", { recursive: true });
    await writeFile(
      formatFileName(`./out/infobox_named/npc/${npc.name}.txt`),
      builder.build()
    );
    return builder;
  } catch (e) {
    console.error("Error building monster infobox", e);
  }
};

export default npcInfoboxGenerator;
