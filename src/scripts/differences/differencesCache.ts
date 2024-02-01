import differencesIndex from "./differencesIndex";
import { LazyPromise } from "../../utils/cache2/LazyPromise";
import { getCacheProviderGithub } from "../clues/utils";

const differencesCache = async (version: string) => {
  const oldCache = await new LazyPromise(() =>
    getCacheProviderGithub(version)
  ).asPromise();
  const newCache = await new LazyPromise(() =>
    getCacheProviderGithub()
  ).asPromise();

  for (let index = 0; index <= 21; index++) {
    const oldIndex = await oldCache.getIndex(index);
    const newIndex = await newCache.getIndex(index);
    if (oldIndex.crc !== newIndex.crc) {
      console.log(
        `[Index=${index}] ${oldIndex.revision} -> ${newIndex.revision}`
      );
      differencesIndex(oldIndex, newIndex);
    } else {
      console.log(`No changes in index ${index}.`);
    }
  }
};

export default differencesCache;
