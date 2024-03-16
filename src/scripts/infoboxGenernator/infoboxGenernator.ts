import { readdir } from "fs/promises";

import itemInfoboxGenerator from "./infoboxes/item";
import npcInfoboxGenerator from "./infoboxes/npc";
import { getCacheProviderGithub } from "../../utils/cache";
import { LazyPromise } from "../../utils/cache2/LazyPromise";

const infoboxGenerator = async (type: string, id?: number) => {
  const cache = new LazyPromise(() => getCacheProviderGithub()).asPromise();
  if (type === "item_defs") {
    if (id) {
      itemInfoboxGenerator(cache, id);
    } else {
      const newItems = await readdir(`./out/differences/added/item_defs`);
      newItems.forEach((file) => {
        itemInfoboxGenerator(cache, parseInt(file.split(".")[0]));
      });
    }
  } else if (type === "npc_defs") {
    if (id) {
      npcInfoboxGenerator(cache, id);
    } else {
      const newItems = await readdir(`./out/differences/added/npc_defs`);
      newItems.forEach((file) => {
        npcInfoboxGenerator(cache, parseInt(file.split(".")[0]));
      });
    }
  }
};

export default infoboxGenerator;
