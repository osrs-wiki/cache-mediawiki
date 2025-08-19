import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "@/context";
import { NPC } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";

// Global map to track NPC name counts
const npcNameCounts = new Map<string, number>();

export const renderNpcs = async (npc: NPC) => {
  // Skip rendering NPCs with null names unless they have multiChildren
  if (
    npc.name.toLocaleLowerCase() === "null" &&
    (!npc.multiChildren || npc.multiChildren.length === 0)
  ) {
    return;
  }

  // Use fallback name for multiChildren NPCs with null names
  const npcName =
    npc.name.toLocaleLowerCase() === "null" ? `Unknown-${npc.id}` : npc.name;

  // Update count for this NPC name
  const currentCount = npcNameCounts.get(npcName) || 0;
  npcNameCounts.set(npcName, currentCount + 1);

  // Determine the display name (first one has no number, subsequent ones get (2), (3), etc.)
  const displayName =
    currentCount === 0 ? npcName : `${npcName} (${currentCount + 1})`;

  try {
    if (
      Context.renders &&
      existsSync(`./data/${Context.renders}/npc/${npc.id}.png`)
    ) {
      await mkdir(`./out/${Context.renders}/npc`, { recursive: true });
      await copyFile(
        `./data/${Context.renders}/npc/${npc.id}.png`,
        formatFileName(`./out/${Context.renders}/npc/${displayName}.png`)
      );

      if (existsSync(`./data/${Context.renders}/chathead/${npc.id}.png`)) {
        await mkdir(`./out/${Context.renders}/chathead`, { recursive: true });
        await copyFile(
          `./data/${Context.renders}/chathead/${npc.id}.png`,
          formatFileName(
            `./out/${Context.renders}/chathead/${displayName} chathead.png`
          )
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};

// Export for testing/debugging
export const getNpcNameCounts = () => npcNameCounts;
export const clearNpcNameCounts = () => npcNameCounts.clear();
