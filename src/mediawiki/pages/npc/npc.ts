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

import { InfoboxMonster } from "./npc.types";

import Context from "@/context";
import { NPC } from "@/utils/cache2";

export const npcPageBuilder = (npc: NPC) => {
  const infoboxNpc =
    npc.combatLevel > 0
      ? new InfoboxTemplate<InfoboxMonster>("Monster", {
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
          id: `${Context.beta ? "beta" : ""}${npc.id.toString()}`,
        })
      : new InfoboxTemplate<InfoboxNpc>("NPC", {
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
          options: npc.actions.filter((action) => action && action !== "null"),
          map: "No",
          examine: Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
          id: `${Context.beta ? "beta" : ""}${npc.id.toString()}`,
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

  return builder;
};

export default npcPageBuilder;
