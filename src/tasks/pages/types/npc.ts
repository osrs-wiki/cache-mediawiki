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
      addNpcToMap(npc);
      writeNpcPage(npc);
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

export const writeNpcPage = async (npc: NPC) => {
  // Ensure the NPC is in the map
  addNpcToMap(npc);
  
  const pageKey = npc.name;
  
  // Avoid writing the same page multiple times
  if (processedNpcs.has(pageKey)) {
    return;
  }
  processedNpcs.add(pageKey);

  const npcsWithSameName = npcNameMap.get(npc.name) || [npc];
  const builder = npcPageBuilder(npcsWithSameName);
  
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
