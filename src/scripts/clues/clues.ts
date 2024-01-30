import {
  generateAnagramPages,
  generateCipherPages,
  generateCoordinatePages,
  generateCrypticPages,
  generateEmotePages,
  generateFairyCrypticPages,
  generateMapPages,
} from "./types";
import { getCacheProviderGithub, getExamines } from "./utils";
import { LazyPromise } from "../../utils/cache2/LazyPromise";

export const ITEM_EXAMINES: { [key: string]: string } = {};

const generateCluePages = async () => {
  const cache = new LazyPromise(() => getCacheProviderGithub()).asPromise();

  const itemExamines = await getExamines("objs");
  Object.keys(itemExamines).forEach((key) => {
    ITEM_EXAMINES[key] = itemExamines[key];
  });

  generateAnagramPages(cache);
  generateMapPages(cache);
  generateCipherPages(cache);
  generateFairyCrypticPages(cache);
  generateCoordinatePages(cache);
  generateCrypticPages(cache);
  generateEmotePages(cache);
};

export default generateCluePages;
