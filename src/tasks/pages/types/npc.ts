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
  // For NPCs with multiChildren and null names, pass only the single NPC to npcPageBuilder
  // The npcPageBuilder will handle loading and rendering multiChildren internally
  if (
    npc.multiChildren &&
    npc.multiChildren.length > 0 &&
    npc.name.toLowerCase() === "null"
  ) {
    const builder = await npcPageBuilder(npc, cache);

    // Use fallback name for multiChildren NPCs with null names
    const cleanName = `Unknown NPC ${npc.id}`;

    // Write to multiChildren directory
    writePageToFile(builder, "npc", cleanName, npc.id.toString(), true);

    if (Context.renders) {
      // Render the parent NPC (the multiChildren will be handled by npcPageBuilder)
      renderNpcs(npc);
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
    // Render all NPCs with this name
    npcsWithSameName.forEach(renderNpcs);
  }
};

// Export for testing/debugging
export const getNpcNameMap = () => npcNameMap;
export const clearNpcNameMap = () => {
  npcNameMap.clear();
  processedNpcs.clear();
};
