import {
  writeAreaPageFromCache,
  writeItemPageFromCache,
  writeMusicPageFromCache,
  writeNpcPageFromCache,
  writeSceneryPageFromCache,
} from "./types";
import Context from "../../context";

import { getCacheProviderGithub, getCacheProviderLocal } from "@/utils/cache";
import { LazyPromise } from "@/utils/cache2/LazyPromise";

type CacheOptions = {
  cacheVersion?: string;
  cacheSource?: "github" | "local";
  cacheType?: "disk" | "flat";
};

const pageGenerator = async (
  type: string,
  id: number,
  options: CacheOptions = {}
) => {
  const {
    cacheVersion = "master",
    cacheSource = "github",
    cacheType = "flat",
  } = options;

  const cache = new LazyPromise(() =>
    cacheSource === "github"
      ? getCacheProviderGithub(cacheVersion)
      : getCacheProviderLocal(cacheVersion, cacheType)
  ).asPromise();
  Context.newCacheProvider = await cache;

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
