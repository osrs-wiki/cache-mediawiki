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
