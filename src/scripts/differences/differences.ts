import { mkdir, writeFile } from "fs/promises";

import differencesBuilder from "./builder";
import { indexNameMap } from "./builder/builder.types";
import {
  ArchiveDifferences,
  CacheDifferences,
  DifferencesParams,
  IndexDifferences,
} from "./differences.types";
import { isEqualBytes } from "./differences.utils";
import differencesFile from "./file/file";
import Context from "../../context";
import {
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "../../utils/cache";
import { FlatIndexData, ArchiveData, DiskIndexData } from "../../utils/cache2";
import { LazyPromise } from "../../utils/cache2/LazyPromise";

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

  const builder = differencesBuilder(cacheDifferences);
  const dir = `./out/differences`;
  await mkdir(dir, { recursive: true });
  await writeFile(
    `${dir}/${newVersion} JSON.json`,
    JSON.stringify(cacheDifferences)
  );
  await writeFile(`${dir}/${newVersion}.txt`, builder.build());
};

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

/**
 * Retrieve the differences between two archives and their files
 * @returns {ArchiveDifferences}
 */
const differencesArchive = async ({
  oldIndex,
  oldArchive,
  newIndex,
  newArchive,
}: {
  oldIndex?: FlatIndexData | DiskIndexData;
  oldArchive?: ArchiveData;
  newIndex?: FlatIndexData | DiskIndexData;
  newArchive?: ArchiveData;
}): Promise<ArchiveDifferences> => {
  const newKeys = newArchive ? Array.from(newArchive.files.keys()) : [];
  const oldKeys = oldArchive ? Array.from(oldArchive.files.keys()) : [];
  const archiveDifferences: ArchiveDifferences = {};

  if (newArchive && oldArchive) {
    const sharedKeys = newKeys.filter((key) => oldArchive.files.has(key));
    await Promise.all(
      sharedKeys.map(async (fileKey) => {
        try {
          const newFile = newArchive.getFile(fileKey);
          const oldFile = oldArchive.getFile(fileKey);
          if (!isEqualBytes(oldFile.data, newFile.data)) {
            console.log(
              `[Index=${newArchive.index}][Archive=${newArchive.archive}] Changed file: ${newFile.id}`
            );
            const results = await differencesFile({
              newFile: { index: newIndex, archive: newArchive, file: newFile },
              oldFile: { index: oldIndex, archive: oldArchive, file: oldFile },
            });
            archiveDifferences[fileKey] = results;
          }
        } catch (error) {
          console.error(
            `Error checking diffs for ${oldIndex.id}/${oldArchive.archive}/${fileKey}`
          );
        }
      })
    );
  }

  const addedKeys = oldArchive
    ? newKeys.filter((key) => !oldArchive.files.has(key))
    : newKeys;
  if (addedKeys) {
    await Promise.all(
      addedKeys.map(async (fileKey) => {
        const newFile = newArchive.getFile(fileKey);
        console.log(
          `[Index=${newArchive.index}][Archive=${newArchive.archive}] Added file: ${newFile.id}`
        );
        const results = await differencesFile({
          newFile: { index: newIndex, archive: newArchive, file: newFile },
        });
        archiveDifferences[fileKey] = archiveDifferences[fileKey]
          ? { ...archiveDifferences[fileKey], ...results }
          : results;
      })
    );
  }

  const removedKeys = newArchive
    ? oldKeys.filter((key) => !newArchive.files.has(key))
    : oldKeys;
  if (removedKeys) {
    await Promise.all(
      removedKeys.map(async (fileKey) => {
        const oldFile = oldArchive.getFile(fileKey);
        console.log(
          `[Index=${oldArchive.index}][Archive=${
            oldArchive.archive
          }] Removed file: ${fileKey.toString()}`
        );
        const results = await differencesFile({
          oldFile: { index: oldIndex, archive: oldArchive, file: oldFile },
        });
        archiveDifferences[fileKey] = archiveDifferences[fileKey]
          ? { ...archiveDifferences[fileKey], ...results }
          : results;
      })
    );
  }

  return archiveDifferences;
};

export default differencesCache;
