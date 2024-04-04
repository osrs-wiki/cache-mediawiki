import itemInfoboxGenerator from "./infoboxes/item";
import npcInfoboxGenerator from "./infoboxes/npc";
import { getCacheProviderGithub } from "../../utils/cache";
import { LazyPromise } from "../../utils/cache2";

const infoboxGenerator = async (type: string, id?: number) => {
  const cache = new LazyPromise(() => getCacheProviderGithub()).asPromise();
  if (type === "item_defs") {
    if (id) {
      itemInfoboxGenerator(cache, id);
    }
  } else if (type === "npc_defs") {
    if (id) {
      npcInfoboxGenerator(cache, id);
    }
  }
};

export default infoboxGenerator;
