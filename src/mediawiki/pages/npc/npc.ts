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

import Context from "@/context";
import InfoboxMonsterTemplate from "@/mediawiki/templates/InfoboxMonster";
import { NPC } from "@/utils/cache2";

export const npcPageBuilder = (npc: NPC) => {
  const infoboxNpc =
    npc.combatLevel > 0
      ? InfoboxMonsterTemplate(npc)
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
