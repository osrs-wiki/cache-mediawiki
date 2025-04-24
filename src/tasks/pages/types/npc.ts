import { writePageToFile } from "../pages.utils";
import { npcPageBuilder } from "../../../mediawiki/pages/npc";
import { CacheProvider, NPC } from "../../../utils/cache2";

export const writeNpcPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const npc = await NPC.load(cache, id);

    if (npc) {
      writeNpcPage(npc);
    }
  } catch (e) {
    console.error(`Error generating page for NPC ${id}: `, e);
  }
};

export const writeNpcPage = async (npc: NPC) => {
  const builder = npcPageBuilder(npc);
  writePageToFile(builder, "npc", npc.name, npc.id.toString());
};
