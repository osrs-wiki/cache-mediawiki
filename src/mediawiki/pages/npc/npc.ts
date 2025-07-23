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

export const npcPageBuilder = (npcs: NPC | NPC[]) => {
  // Normalize to array
  const npcArray = Array.isArray(npcs) ? npcs : [npcs];
  
  // Use the first NPC for the primary display
  const primaryNpc = npcArray[0];
  
  // Determine if we should use Monster or NPC infobox based on any having combat level
  const hasMonster = npcArray.some(npc => npc.combatLevel > 0);
  const infoboxNpc = hasMonster 
    ? InfoboxMonsterTemplate(npcArray) 
    : InfoboxNpcTemplate(npcArray);

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxNpc.build(),
    new MediaWikiFile(`${primaryNpc.name} chathead.png`, {
      horizontalAlignment: "left",
    }),
    new MediaWikiBreak(),
    new MediaWikiText(primaryNpc.name, { bold: true }),
  ]);

  return builder;
};

export default npcPageBuilder;
