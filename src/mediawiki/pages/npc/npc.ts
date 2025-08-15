import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "../../../context";

import InfoboxMonsterTemplate from "@/mediawiki/templates/InfoboxMonster";
import InfoboxNpcTemplate from "@/mediawiki/templates/InfoboxNpc";
import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export const npcPageBuilder = (npc: NPC) => {
  const cleanName = stripHtmlTags(npc.name);
  const infoboxNpc =
    npc.combatLevel > 0 ? InfoboxMonsterTemplate(npc) : InfoboxNpcTemplate(npc);

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([infoboxNpc.build()]);

  // Only add chathead image if NPC has chathead models
  if (npc.chatheadModels.length > 0) {
    builder.addContents([
      new MediaWikiFile(`${cleanName} chathead.png`, {
        horizontalAlignment: "left",
      }),
      new MediaWikiBreak(),
      new MediaWikiText(`${cleanName}`, { bold: true }),
      new MediaWikiText(" is an NPC."),
    ]);
  }

  builder.addContent(new MediaWikiText(cleanName, { bold: true }));

  if (npc.actions.includes("Talk-to")) {
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
