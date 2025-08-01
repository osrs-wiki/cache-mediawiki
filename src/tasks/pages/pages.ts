import {
  writeAreaPageFromCache,
  writeItemPageFromCache,
  writeMusicPageFromCache,
  writeNpcPageFromCache,
  writeSceneryPageFromCache,
} from "./types";

import { getCacheProviderGithub } from "@/utils/cache";
import { LazyPromise } from "@/utils/cache2/LazyPromise";

const pageGenerator = async (type: string, id: number) => {
  const cache = new LazyPromise(() => getCacheProviderGithub()).asPromise();

  switch (type) {
    case "area":
      writeAreaPageFromCache(cache, id);
      break;
    case "item":
      writeItemPageFromCache(cache, id);
      break;
    case "music":
      writeMusicPageFromCache(cache, id);
      break;
    case "npc":
      writeNpcPageFromCache(cache, id);
      break;
    case "scenery":
      writeSceneryPageFromCache(cache, id);
      break;
    default:
      console.error(`Unknown type: ${type}`);
  }
};

export default pageGenerator;
