import { differencesArchive } from "../archive";
import { IndexDifferences } from "../differences.types";

import { DiskIndexData, FlatIndexData } from "@/utils/cache2";

/**
 * Retrieve the differences between two indices, their archives, and their files.
 * @param oldIndex The old index
 * @param newIndex The new index
 * @returns {IndexDifferences}
 */
const differencesIndex = async (
  oldIndex: FlatIndexData | DiskIndexData,
  newIndex: FlatIndexData | DiskIndexData
): Promise<IndexDifferences> => {
  const newKeys = Array.from(newIndex.archives.keys());
  const oldKeys = Array.from(oldIndex.archives.keys());
  const indexDifferences: IndexDifferences = {};

  const sharedKeys = newKeys.filter((key) => oldIndex.archives.has(key));
  await Promise.all(
    sharedKeys.map(async (archiveKey) => {
      const newArchive = newIndex.archives.get(archiveKey);
      const oldArchive = oldIndex.archives.get(archiveKey);

      if (newArchive.crc !== oldArchive.crc) {
        console.log(
          `[Index=${newIndex.id}] Changed archive: ${newArchive.archive} - (${oldArchive.files.size} -> ${newArchive.files.size})`
        );
        indexDifferences[archiveKey] = await differencesArchive({
          oldIndex,
          oldArchive,
          newIndex,
          newArchive,
        });
      }
    })
  );

  const addedKeys = newKeys.filter((key) => !oldIndex.archives.has(key));
  await Promise.all(
    addedKeys.map(async (archiveKey) => {
      const newArchive = newIndex.archives.get(archiveKey);
      console.log(
        `[Index=${newIndex.id}] Added archive: ${newArchive.archive} (${newArchive.files.size} files)`
      );
      const results = await differencesArchive({
        newIndex,
        newArchive,
      });
      indexDifferences[archiveKey] = indexDifferences[archiveKey]
        ? {
            ...indexDifferences[archiveKey],
            ...results,
          }
        : results;
    })
  );

  const removedKeys = oldKeys.filter((key) => !newIndex.archives.has(key));
  await Promise.all(
    removedKeys.map(async (archiveKey) => {
      const oldArchive = oldIndex.archives.get(archiveKey);
      console.log(
        `[Index=${newIndex.id}] Removed archive: ${oldArchive.archive} (${oldArchive.files.size} files)`
      );
      const results = await differencesArchive({
        oldIndex,
        oldArchive,
      });
      indexDifferences[archiveKey] = indexDifferences[archiveKey]
        ? {
            ...indexDifferences[archiveKey],
            ...results,
          }
        : results;
    })
  );

  return indexDifferences;
};

export { differencesIndex };
