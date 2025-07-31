import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import InfoboxMonsterTemplate from "@/mediawiki/templates/InfoboxMonster";
import InfoboxNpcTemplate from "@/mediawiki/templates/InfoboxNpc";
import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export const npcPageBuilder = (npcs: NPC | NPC[]) => {
  // Normalize to array
  const npcArray = Array.isArray(npcs) ? npcs : [npcs];

  // Use the first NPC for the primary display
  const primaryNpc = npcArray.filter((npc) => npc.name)[0] || npcArray[0];
  const cleanPrimaryName = stripHtmlTags(primaryNpc.name);

  // Determine if we should use Monster or NPC infobox based on any having combat level
  const hasMonster = npcArray.some((npc) => npc.combatLevel > 0);
  const hasDialogue = npcArray.some((npc) => npc.actions.includes("Talk-to"));
  const infoboxNpc = hasMonster
    ? InfoboxMonsterTemplate(npcArray)
    : InfoboxNpcTemplate(npcArray);

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxNpc.build(),
  ]);

  // Only add chathead image if NPC has chathead models
  if (primaryNpc.chatheadModels?.length > 0) {
    builder.addContents([
      new MediaWikiFile(`${cleanPrimaryName} chathead.png`, {
        horizontalAlignment: "left",
      }),
      new MediaWikiBreak(),
    ]);
  }

  builder.addContent(new MediaWikiText(cleanPrimaryName, { bold: true }));

  if (hasDialogue) {
    const transcriptTemplate = new MediaWikiTemplate("Hastranscript");
    transcriptTemplate.add("", "npc");
    builder.addContents([
      new MediaWikiBreak(),
      new MediaWikiBreak(),
      new MediaWikiHeader("Dialogue", 2),
      new MediaWikiBreak(),
      transcriptTemplate,
    ]);
  }

  return builder;
};

export default npcPageBuilder;
