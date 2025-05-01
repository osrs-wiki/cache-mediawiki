import { mkdir, writeFile } from "fs/promises";

import { CacheDifferences, DifferencesParams } from "./differences.types";
import { differencesIndex } from "./index";

import Context from "@/context";
import {
  differencesPageBuilder,
  indexNameMap,
} from "@/mediawiki/pages/differences";
import { getCacheProviderGithub, getCacheProviderLocal } from "@/utils/cache";
import { LazyPromise } from "@/utils/cache2/LazyPromise";

/**
 * Write cache differences to output files.
 * @param oldVersion The old abex cache version (ex: 2024-01-31-rev219)
 * @param newVersion The new abex cache version (ex: 2024-02-07-rev219)
 */
const differencesCache = async ({
  oldVersion,
  newVersion = "master",
  method = "github",
  type = "disk",
}: DifferencesParams) => {
  Context.oldCacheProvider = await new LazyPromise(() =>
    method === "github"
      ? getCacheProviderGithub(oldVersion)
      : getCacheProviderLocal(oldVersion, type)
  ).asPromise();
  Context.newCacheProvider = await new LazyPromise(() =>
    method === "github"
      ? getCacheProviderGithub(newVersion)
      : getCacheProviderLocal(newVersion, type)
  ).asPromise();

  const cacheDifferences: CacheDifferences = {};
  await Promise.all(
    Object.keys(indexNameMap).map(async (indexString) => {
      const index = parseInt(indexString);
      console.log(`Checking index ${index} differences`);
      const oldIndex = await Context.oldCacheProvider.getIndex(index);
      const newIndex = await Context.newCacheProvider.getIndex(index);
      if (oldIndex.crc !== newIndex.crc) {
        console.log(
          `[Index=${index}] ${oldIndex.revision} -> ${newIndex.revision}`
        );
        cacheDifferences[index] = await differencesIndex(oldIndex, newIndex);
      } else {
        console.log(`No changes in index ${index}.`);
      }
    })
  );

  const builder = differencesPageBuilder(cacheDifferences);
  const dir = `./out/differences`;
  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/${newVersion} JSON.json`,
    JSON.stringify(cacheDifferences)
  );
  await writeFile(`${dir}/${newVersion}.txt`, builder.build());
};

export default differencesCache;
