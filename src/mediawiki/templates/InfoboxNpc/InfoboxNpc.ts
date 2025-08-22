import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { InfoboxNpc } from "./InfoboxNpc.types";
import { InfoboxTemplate } from "../InfoboxTemplate";

import Context from "@/context";
import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

/**
 * Creates InfoboxNpc data for a single NPC
 */
const createInfoboxNpcData = (npc: NPC, index = 0): InfoboxNpc => {
  const cleanName = stripHtmlTags(npc.name);
  
  return {
    name: cleanName,
    image: new MediaWikiFile(
      `${cleanName}${index > 0 ? ` (${index + 1})` : ""}.png`,
      {
        resizing: { width: 120 },
      }
    ),
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
  };
};

const InfoboxNpcTemplate = (npcs: NPC | NPC[]) => {
  const npcArray = Array.isArray(npcs) ? npcs : [npcs];

  if (npcArray.length === 1) {
    // Single NPC - existing behavior
    const infoboxData = createInfoboxNpcData(npcArray[0]);
    return new InfoboxTemplate<InfoboxNpc>("NPC", infoboxData);
  } else {
    // Multiple NPCs
    const infoboxDataArray = npcArray.map((npc, index) =>
      createInfoboxNpcData(npc, index)
    );
    return new InfoboxTemplate<InfoboxNpc>("NPC", infoboxDataArray);
  }
};

export default InfoboxNpcTemplate;
