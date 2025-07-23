import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { InfoboxNpc } from "./InfoboxNpc.types";
import { InfoboxTemplate } from "../InfoboxTemplate";

import Context from "@/context";
import { NPC } from "@/utils/cache2";

const InfoboxNpcTemplate = (npcs: NPC | NPC[]) => {
  const npcArray = Array.isArray(npcs) ? npcs : [npcs];
  
  if (npcArray.length === 1) {
    // Single NPC - existing behavior
    const npc = npcArray[0];
    const infoboxData: InfoboxNpc = {
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
    };

    return new InfoboxTemplate<InfoboxNpc>("NPC", infoboxData);
  } else {
    // Multiple NPCs
    const infoboxDataArray: InfoboxNpc[] = npcArray.map((npc, index) => ({
      name: npc.name as string,
      image: new MediaWikiFile(`${npc.name}${index > 0 ? ` (${index + 1})` : ""}.png`, {
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
    }));
    
    return new InfoboxTemplate<InfoboxNpc>("NPC", infoboxDataArray);
  }
};

export default InfoboxNpcTemplate;
