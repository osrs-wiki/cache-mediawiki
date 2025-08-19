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
import { CacheProvider, NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export const npcPageBuilder = async (
  npcs: NPC | NPC[],
  cache?: Promise<CacheProvider>
): Promise<MediaWikiBuilder> => {
  // Handle single NPC with multiChildren - load children and render them instead of parent
  if (
    !Array.isArray(npcs) &&
    npcs.multiChildren &&
    npcs.multiChildren.length > 0
  ) {
    // Load all valid child NPCs using the new getMultiChildren method
    const childNpcs: NPC[] = [];

    // If parent has a valid name (not null), include it as the first element
    if (npcs.name && npcs.name.toLowerCase() !== "null") {
      childNpcs.push(npcs);
    }

    if (cache) {
      try {
        const loadedChildren = await npcs.getMultiChildren(cache);
        childNpcs.push(...loadedChildren);
      } catch (e) {
        console.warn(
          `Failed to load child NPCs for parent ${npcs.id}:`,
          e
        );
      }
    } else {
      console.warn(
        `No cache provided for NPC ${npcs.id} with multiChildren: ${npcs.multiChildren}. Cannot load child NPCs.`
      );
    }

    if (childNpcs.length > 0) {
      // Use child NPCs for rendering - but don't recurse, process them directly
      return npcPageBuilder(childNpcs);
    } else {
      // If no valid children found, fallback to rendering the parent NPC itself
      console.warn(
        `No valid child NPCs found for parent NPC ${npcs.id} with multiChildren: ${npcs.multiChildren}. Falling back to parent NPC.`
      );
      return npcPageBuilder([npcs]);
    }
  }

  // Normalize to array
  const npcArray = Array.isArray(npcs) ? npcs : [npcs];

  // Use the first NPC with a non-null name for the primary display, or fallback to first NPC
  const primaryNpc =
    npcArray.filter(
      (npc) => npc.name && npc.name.toLowerCase() !== "null"
    )[0] || npcArray[0];

  // Handle naming for multiChildren NPCs with null names
  let cleanPrimaryName: string;
  if (primaryNpc.name && primaryNpc.name.toLowerCase() !== "null") {
    cleanPrimaryName = stripHtmlTags(primaryNpc.name);
  } else {
    // Use fallback name for null-named NPCs
    cleanPrimaryName = `Unknown NPC ${primaryNpc.id}`;
  }

  // Determine if we should use Monster or NPC infobox based on any having combat level
  const hasMonster = npcArray.some((npc) => npc.combatLevel > 0);
  const hasDialogue = npcArray.some((npc) => npc.actions.includes("Talk-to"));
  const infoboxNpc = hasMonster
    ? InfoboxMonsterTemplate(npcArray)
    : InfoboxNpcTemplate(npcArray);

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([infoboxNpc.build()]);

  // Only add chathead image if NPC has chathead models
  if (primaryNpc.chatheadModels?.length > 0) {
    builder.addContents([
      new MediaWikiFile(`${cleanPrimaryName} chathead.png`, {
        horizontalAlignment: "left",
      }),
      new MediaWikiBreak(),
      new MediaWikiText(`${cleanPrimaryName}`, { bold: true }),
      new MediaWikiText(" is an NPC."),
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
