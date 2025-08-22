import Context from "../../../context";
import { renderNpcs } from "../../renders";
import { writePageToFile } from "../pages.utils";

import { npcPageBuilder } from "@/mediawiki/pages/npc";
import { CacheProvider, NPC } from "@/utils/cache2";

// Global map to track NPCs by name
const npcNameMap = new Map<string, NPC[]>();
// Track which NPCs we've already processed to avoid duplicates
const processedNpcs = new Set<string>();

export const writeNpcPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const npc = await NPC.load(cache, id);

    if (npc) {
      await writeNpcPage(npc, cache);
    }
  } catch (e) {
    console.error(`Error generating page for NPC ${id}: `, e);
  }
};

const addNpcToMap = (npc: NPC) => {
  const name = npc.name;
  if (!npcNameMap.has(name)) {
    npcNameMap.set(name, []);
  }
  const npcList = npcNameMap.get(name);
  if (npcList) {
    npcList.push(npc);
  }
};

export const writeNpcPage = async (
  npc: NPC,
  cache?: Promise<CacheProvider>
) => {
  // For NPCs with multiChildren, pass the single NPC to npcPageBuilder
  // The npcPageBuilder will handle loading and rendering multiChildren internally
  if (npc.multiChildren && npc.multiChildren.length > 0) {
    const builder = await npcPageBuilder(npc, cache);

    // Use getName method to get the best available name
    let cleanName: string;
    if (cache) {
      try {
        cleanName = await npc.getName(cache);
      } catch (error) {
        console.warn(
          `Failed to get name for NPC ${npc.id}, using fallback:`,
          error
        );
        cleanName = `Unknown NPC ${npc.id}`;
      }
    } else {
      // Fallback when no cache is available
      cleanName =
        npc.name && npc.name.toLowerCase() !== "null"
          ? npc.name
          : `Unknown NPC ${npc.id}`;
    }

    // Write to multiChildren directory for null names, regular directory for named NPCs
    const isMultiChildrenDir = !npc.name || npc.name.toLowerCase() === "null";
    writePageToFile(
      builder,
      "npc",
      cleanName,
      npc.id.toString(),
      isMultiChildrenDir
    );

    if (Context.renders) {
      // Render the parent NPC and its multiChildren with cache parameter
      renderNpcs(npc, cache);
    }
    return;
  }

  // Regular name-based grouping for NPCs with valid names
  addNpcToMap(npc);

  const pageKey = npc.name;

  // Avoid writing the same page multiple times
  if (processedNpcs.has(pageKey)) {
    return;
  }
  processedNpcs.add(pageKey);

  const npcsWithSameName = npcNameMap.get(npc.name) || [npc];
  const builder = await npcPageBuilder(npcsWithSameName, cache);

  // Use the first NPC's ID for the file name
  writePageToFile(builder, "npc", npc.name, npcsWithSameName[0].id.toString());

  if (Context.renders) {
    // Render all NPCs with this name, passing cache parameter
    npcsWithSameName.forEach((npc) => renderNpcs(npc, cache));
  }
};

// Export for testing/debugging
export const getNpcNameMap = () => npcNameMap;
export const clearNpcNameMap = () => {
  npcNameMap.clear();
  processedNpcs.clear();
};
