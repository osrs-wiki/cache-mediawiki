import {
  generateAnagramPages,
  generateCipherPages,
  generateCoordinatePages,
  generateCrypticPages,
  generateEmotePages,
  generateFairyCrypticPages,
  generateMapPages,
  generateMusicPages,
} from "./types";
import {
  CacheFileType,
  CacheSource,
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "../../utils/cache";
import { LazyPromise } from "../../utils/cache2/LazyPromise";
import { getExamines } from "../../utils/examines";

export const ITEM_EXAMINES: { [key: string]: string } = {};

const generateCluePages = async (
  method: CacheSource,
  version: string,
  type: CacheFileType
) => {
  const cache = new LazyPromise(() =>
    method === "github"
      ? getCacheProviderGithub(version)
      : getCacheProviderLocal(version, type)
  ).asPromise();

  const itemExamines = await getExamines("objs");
  Object.keys(itemExamines).forEach((key) => {
    ITEM_EXAMINES[key] = itemExamines[key];
  });

  generateAnagramPages(cache);
  generateMapPages(cache);
  generateMusicPages(cache);
  generateCipherPages(cache);
  generateFairyCrypticPages(cache);
  generateCoordinatePages(cache);
  generateCrypticPages(cache);
  generateEmotePages(cache);
};

export default generateCluePages;
