import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { groupNpcsByType } from "./npc.utils";
import Context from "../../../context";

import InfoboxMonsterTemplate from "@/mediawiki/templates/InfoboxMonster";
import InfoboxNpcTemplate from "@/mediawiki/templates/InfoboxNpc";
import { SwitchInfobox } from "@/mediawiki/templates/SwitchInfobox";
import {
  SyncedSwitch,
  getVersionedImageName,
} from "@/mediawiki/templates/SyncedSwitch";
import { CacheProvider, NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export const npcPageBuilder = async (
  npcs: NPC | NPC[],
  cache?: Promise<CacheProvider>
): Promise<MediaWikiBuilder> => {
  // Handle single NPC with multiChildren - load children and render them with parent
  if (
    !Array.isArray(npcs) &&
    npcs.multiChildren &&
    npcs.multiChildren.length > 0
  ) {
    // Load all valid child NPCs using the new getMultiChildren method
    const allNpcs: NPC[] = [];

    // If parent has a valid name (not null), include it as the first element
    if (npcs.name && npcs.name.toLowerCase() !== "null") {
      allNpcs.push(npcs);
    }

    if (cache) {
      try {
        const loadedChildren = await npcs.getMultiChildren(cache);
        allNpcs.push(...loadedChildren);
      } catch (e) {
        console.warn(`Failed to load child NPCs for parent ${npcs.id}:`, e);
      }
    } else {
      console.warn(
        `No cache provided for NPC ${npcs.id} with multiChildren: ${npcs.multiChildren}. Cannot load child NPCs.`
      );
    }

    if (allNpcs.length > 0) {
      // Use all NPCs (parent + children) for rendering - but don't recurse, process them directly
      return npcPageBuilder(allNpcs);
    } else {
      // If no valid NPCs found, fallback to rendering the parent NPC itself
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

  // Get the clean primary name using the new getName method
  let cleanPrimaryName: string;
  if (cache) {
    try {
      cleanPrimaryName = stripHtmlTags(await primaryNpc.getName(cache));
    } catch (error) {
      console.warn(
        `Failed to get name for NPC ${primaryNpc.id}, using fallback:`,
        error
      );
      cleanPrimaryName = `Unknown NPC ${primaryNpc.id}`;
    }
  } else {
    // Fallback when no cache is available
    if (primaryNpc.name && primaryNpc.name.toLowerCase() !== "null") {
      cleanPrimaryName = stripHtmlTags(primaryNpc.name);
    } else {
      cleanPrimaryName = `Unknown NPC ${primaryNpc.id}`;
    }
  }

  // Group NPCs by type (combat vs non-combat)
  const groups = groupNpcsByType(npcArray);

  let infoboxContent;

  if (groups.length === 1) {
    // Single type - use existing logic
    const group = groups[0];
    infoboxContent =
      group.type === "monster"
        ? InfoboxMonsterTemplate(group.npcs)
        : InfoboxNpcTemplate(group.npcs);
  } else {
    // Multiple types - use Switch infobox
    const switchItems = groups.map((group) => ({
      text: group.label,
      item: (group.type === "monster"
        ? InfoboxMonsterTemplate(group.npcs)
        : InfoboxNpcTemplate(group.npcs)
      )
        .build()
        .build(),
    }));

    infoboxContent = new SwitchInfobox(switchItems);
  }

  const hasDialogue = npcArray.some((npc) => npc.actions.includes("Talk-to"));

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([infoboxContent.build()]);

  // Add chathead image(s) if NPC has chathead models
  if (primaryNpc.chatheadModels?.length > 0) {
    if (npcArray.length > 1) {
      // Multiple NPCs - use SyncedSwitch for versioned chatheads
      const chatheadVersions = npcArray.map((_, index) => ({
        version: index + 1,
        content: new MediaWikiFile(
          getVersionedImageName(cleanPrimaryName, index, " chathead"),
          {
            horizontalAlignment: "left",
          }
        ).build(),
      }));

      builder.addContents([new SyncedSwitch(chatheadVersions).build()]);
    } else {
      // Single NPC - use static chathead
      builder.addContents([
        new MediaWikiFile(`${cleanPrimaryName} chathead.png`, {
          horizontalAlignment: "left",
        }),
        new MediaWikiBreak(),
      ]);
    }
  }

  builder.addContents([
    new MediaWikiText(`${cleanPrimaryName}`, { bold: true }),
    new MediaWikiText(" is an NPC."),
  ]);

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
