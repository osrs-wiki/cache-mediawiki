import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import InfoboxMonsterTemplate from "@/mediawiki/templates/InfoboxMonster";
import InfoboxNpcTemplate from "@/mediawiki/templates/InfoboxNpc";
import { NPC } from "@/utils/cache2";

export const npcPageBuilder = (npc: NPC) => {
  const infoboxNpc =
    npc.combatLevel > 0 ? InfoboxMonsterTemplate(npc) : InfoboxNpcTemplate(npc);

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
