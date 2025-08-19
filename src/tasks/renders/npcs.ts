import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "@/context";
import { CacheProvider, NPC } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";

// Global map to track NPC name counts
const npcNameCounts = new Map<string, number>();

export const renderNpcs = async (npc: NPC, cache?: Promise<CacheProvider>) => {
  // Handle multiChildren NPCs - render both parent and children
  if (npc.multiChildren && npc.multiChildren.length > 0 && cache) {
    try {
      const childNpcs = await npc.getMultiChildren(cache);
      
      // Render parent NPC if it has a valid name
      if (npc.name && npc.name.toLowerCase() !== "null") {
        await renderSingleNpc(npc, true);
      }
      
      // Render all child NPCs
      for (const childNpc of childNpcs) {
        await renderSingleNpc(childNpc, true);
      }
      
      return;
    } catch (e) {
      console.warn(`Failed to render multiChildren for NPC ${npc.id}:`, e);
      // Fall through to render parent only
    }
  }
  
  // Standard single NPC rendering
  await renderSingleNpc(npc, false);
};

const renderSingleNpc = async (npc: NPC, isMultiChildren: boolean) => {
  // Skip rendering NPCs with null names unless they have multiChildren
  if (
    npc.name.toLowerCase() === "null" &&
    (!npc.multiChildren || npc.multiChildren.length === 0)
  ) {
    return;
  }

  // Use fallback name for multiChildren NPCs with null names
  const npcName =
    npc.name.toLowerCase() === "null" ? `Unknown-${npc.id}` : npc.name;

  // Update count for this NPC name
  const currentCount = npcNameCounts.get(npcName) || 0;
  npcNameCounts.set(npcName, currentCount + 1);

  // Determine the display name (first one has no number, subsequent ones get (2), (3), etc.)
  const displayName =
    currentCount === 0 ? npcName : `${npcName} (${currentCount + 1})`;

  // Determine output directories based on multiChildren status
  const npcDir = isMultiChildren 
    ? `./out/${Context.renders}/npc/multiChildren`
    : `./out/${Context.renders}/npc`;
  const chatheadDir = isMultiChildren
    ? `./out/${Context.renders}/chathead/multiChildren`
    : `./out/${Context.renders}/chathead`;

  try {
    if (
      Context.renders &&
      existsSync(`./data/${Context.renders}/npc/${npc.id}.png`)
    ) {
      await mkdir(npcDir, { recursive: true });
      await copyFile(
        `./data/${Context.renders}/npc/${npc.id}.png`,
        formatFileName(`${npcDir}/${displayName}.png`)
      );

      if (existsSync(`./data/${Context.renders}/chathead/${npc.id}.png`)) {
        await mkdir(chatheadDir, { recursive: true });
        await copyFile(
          `./data/${Context.renders}/chathead/${npc.id}.png`,
          formatFileName(`${chatheadDir}/${displayName} chathead.png`)
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
