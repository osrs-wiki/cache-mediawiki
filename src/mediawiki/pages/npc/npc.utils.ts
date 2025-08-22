import { NpcGroup } from "./npc.types";

import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

export function groupNpcsByType(npcs: NPC[]): NpcGroup[] {
  const monsters = npcs.filter((npc) => npc.combatLevel > 0);
  const nonCombat = npcs.filter((npc) => npc.combatLevel === 0);

  const groups: NpcGroup[] = [];

  if (nonCombat.length > 0) {
    groups.push({
      type: "npc",
      npcs: nonCombat,
      label: generateNpcGroupLabel(nonCombat),
    });
  }

  if (monsters.length > 0) {
    groups.push({
      type: "monster",
      npcs: monsters,
      label: generateMonsterGroupLabel(monsters),
    });
  }

  return groups;
}

function generateNpcGroupLabel(npcs: NPC[]): string {
  // Logic to generate appropriate labels like "Royal servant", "Cultist"
  // Could be based on NPC names, contexts, or other attributes
  const firstNpc = npcs[0];
  if (firstNpc.name && firstNpc.name.toLowerCase() !== "null") {
    return stripHtmlTags(firstNpc.name);
  }
  return "NPC";
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateMonsterGroupLabel(npcs: NPC[]): string {
  // Generate labels like "In combat", "Combat form"
  return "In combat";
}
