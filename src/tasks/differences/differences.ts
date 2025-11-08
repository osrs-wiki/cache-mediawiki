import { mkdir, writeFile } from "fs/promises";

import { writeDifferencesCSV } from "./csv";
import { CacheDifferences, DifferencesParams } from "./differences.types";
import { differencesIndex } from "./index";
import { IndexType } from "../../utils/cache2";

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
 * @param indices Optional array of index IDs to check (ex: [2, 5, 8])
 * @param ignoreIndices Optional array of index IDs to exclude from differences (ex: [2, 5, 8]). Takes precedence over indices option.
 */
const differencesCache = async ({
  oldVersion,
  newVersion = "master",
  method = "github",
  type = "disk",
  indices,
  ignoreIndices,
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

  // Determine which indices to check
  let indicesToCheck = indices || Object.keys(indexNameMap).map(Number);

  // Filter out ignored indices (takes precedence over indices option)
  if (ignoreIndices) {
    indicesToCheck = indicesToCheck.filter(
      (index) => !ignoreIndices.includes(index)
    );
  }

  await Promise.all(
    indicesToCheck.map(async (index) => {
      // Skip if index is not in indexNameMap when filtering by specific indices
      if (indices && !(index in indexNameMap)) {
        console.log(`Skipping index ${index} - not found in indexNameMap`);
        return;
      }

      console.log(`Checking index ${index} differences`);
      const oldIndex = await Context.oldCacheProvider.getIndex(index);
      const newIndex = await Context.newCacheProvider.getIndex(index);
      if (oldIndex.crc !== newIndex.crc) {
        console.log(
          `[Index=${index}] ${oldIndex.revision} -> ${newIndex.revision}`
        );
        if (
          index === IndexType.Maps &&
          (Context.oldCacheProvider.getKeys().hasKeys() === false ||
            Context.newCacheProvider.getKeys().hasKeys() === false)
        ) {
          console.warn(
            `Warning: XTEA keys are missing for Maps index decryption.`
          );
          return;
        }
        cacheDifferences[index] = await differencesIndex(oldIndex, newIndex);
      } else {
        console.log(`No changes in index ${index}.`);
      }
    })
  );

  const builder = differencesPageBuilder(cacheDifferences);
  const dir = `./out/differences`;
  await mkdir(dir, { recursive: true });

  // Write JSON output
  await writeFile(
    `${dir}/${newVersion} JSON.json`,
    JSON.stringify(cacheDifferences)
  );

  // Write MediaWiki content
  await writeFile(
    `${dir}/${newVersion} content.txt`,
    JSON.stringify(builder.content)
  );

  // Write MediaWiki text
  await writeFile(`${dir}/${newVersion}.txt`, builder.build());

  // Write CSV outputs
  console.log("Generating CSV exports...");
  const csvOutputFiles = await writeDifferencesCSV(cacheDifferences, {
    outputDir: dir,
    version: newVersion,
    includeURLs: true,
    flattenObjects: true,
    includeTimestamp: true,
  });

  console.log(`CSV files generated:`);
  console.log(`- Summary: ${csvOutputFiles.summary}`);
  console.log(`- Detailed: ${csvOutputFiles.detailed}`);
  console.log(
    `- Index-specific: ${Object.keys(csvOutputFiles.byIndex).length} files`
  );
  console.log(
    `- Change type specific: ${
      Object.keys(csvOutputFiles.byChangeType).length
    } files`
  );
};

export default differencesCache;
