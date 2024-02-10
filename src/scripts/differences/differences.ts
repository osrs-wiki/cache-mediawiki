import { mkdir, writeFile } from "fs/promises";

import differencesBuilder from "./builder";
import {
  ArchiveDifferences,
  CacheDifferences,
  IndexDifferences,
} from "./differences.types";
import { isEqualBytes } from "./differences.utils";
import differencesFile from "./file/file";
import { FlatIndexData, ArchiveData } from "../../utils/cache2";
import { LazyPromise } from "../../utils/cache2/LazyPromise";
import { getCacheProviderGithub } from "../clues/utils";

const differencesCache = async (oldVersion: string, newVersion = "master") => {
  const oldCache = await new LazyPromise(() =>
    getCacheProviderGithub(oldVersion)
  ).asPromise();
  const newCache = await new LazyPromise(() =>
    getCacheProviderGithub(newVersion)
  ).asPromise();

  const cacheDifferences: CacheDifferences = {};
  for (let index = 0; index <= 2; index++) {
    const oldIndex = await oldCache.getIndex(index);
    const newIndex = await newCache.getIndex(index);
    if (oldIndex.crc !== newIndex.crc) {
      console.log(
        `[Index=${index}] ${oldIndex.revision} -> ${newIndex.revision}`
      );
      cacheDifferences[index] = differencesIndex(oldIndex, newIndex);
    } else {
      console.log(`No changes in index ${index}.`);
    }
  }

  console.log(JSON.stringify(cacheDifferences));
  const builder = differencesBuilder(cacheDifferences);
  const dir = `./out/differences`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/${newVersion}.txt`, builder.build());
};

const differencesIndex = (
  oldIndex: FlatIndexData,
  newIndex: FlatIndexData
): IndexDifferences => {
  const newKeys = Array.from(newIndex.archives.keys());
  const oldKeys = Array.from(oldIndex.archives.keys());
  const indexDifferences: IndexDifferences = {};

  const sharedKeys = newKeys.filter((key) => oldIndex.archives.has(key));
  sharedKeys.forEach((archiveKey) => {
    const newArchive = newIndex.archives.get(archiveKey);
    const oldArchive = oldIndex.archives.get(archiveKey);

    if (newArchive.crc !== oldArchive.crc) {
      console.log(
        `[Index=${newIndex.id}] Changed archive: ${newArchive.archive} - (${oldArchive.files.size} -> ${newArchive.files.size})`
      );
      indexDifferences[archiveKey] = differencesArchive({
        oldIndex,
        oldArchive,
        newIndex,
        newArchive,
      });
    }
  });

  const addedKeys = newKeys.filter((key) => !oldIndex.archives.has(key));
  addedKeys.forEach((archiveKey) => {
    const newArchive = newIndex.archives.get(archiveKey);
    console.log(
      `[Index=${newIndex.id}] Added archive: ${newArchive.archive} (${newArchive.files.size} files)`
    );
    const results = differencesArchive({
      newIndex,
      newArchive,
    });
    indexDifferences[archiveKey] = indexDifferences[archiveKey]
      ? {
          ...indexDifferences[archiveKey],
          ...results,
        }
      : results;
  });

  const removedKeys = oldKeys.filter((key) => !newIndex.archives.has(key));
  removedKeys.forEach((archiveKey) => {
    const oldArchive = oldIndex.archives.get(archiveKey);
    console.log(
      `[Index=${newIndex.id}] Removed archive: ${oldArchive.archive} (${oldArchive.files.size} files)`
    );
    const results = differencesArchive({
      oldIndex,
      oldArchive,
    });
    indexDifferences[archiveKey] = indexDifferences[archiveKey]
      ? {
          ...indexDifferences[archiveKey],
          ...results,
        }
      : results;
  });

  return indexDifferences;
};

const differencesArchive = ({
  oldIndex,
  oldArchive,
  newIndex,
  newArchive,
}: {
  oldIndex?: FlatIndexData;
  oldArchive?: ArchiveData;
  newIndex?: FlatIndexData;
  newArchive?: ArchiveData;
}): ArchiveDifferences => {
  const newKeys = newArchive ? Array.from(newArchive.files.keys()) : [];
  const oldKeys = oldArchive ? Array.from(oldArchive.files.keys()) : [];
  const archiveDifferences: ArchiveDifferences = {};

  if (newArchive && oldArchive) {
    const sharedKeys = newKeys.filter((key) => oldArchive.files.has(key));
    sharedKeys.forEach((fileKey) => {
      try {
        const newFile = newArchive.getFile(fileKey);
        const oldFile = oldArchive.getFile(fileKey);
        if (!isEqualBytes(oldFile.data, newFile.data)) {
          console.log(
            `[Index=${newArchive.index}][Archive=${newArchive.archive}] Changed file: ${newFile.id}`
          );
          const results = differencesFile({
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
    });
  }

  const addedKeys = oldArchive
    ? newKeys.filter((key) => !oldArchive.files.has(key))
    : newKeys;
  addedKeys?.forEach((fileKey) => {
    const newFile = newArchive.getFile(fileKey);
    console.log(
      `[Index=${newArchive.index}][Archive=${newArchive.archive}] Added file: ${newFile.id}`
    );
    const results = differencesFile({
      newFile: { index: newIndex, archive: newArchive, file: newFile },
    });
    archiveDifferences[fileKey] = archiveDifferences[fileKey]
      ? { ...archiveDifferences[fileKey], ...results }
      : results;
  });

  const removedKeys = newArchive
    ? oldKeys.filter((key) => !newArchive.files.has(key))
    : oldKeys;
  removedKeys?.forEach((fileKey) => {
    const oldFile = oldArchive.getFile(fileKey);
    console.log(
      `[Index=${oldArchive.index}][Archive=${
        oldArchive.archive
      }] Removed file: ${fileKey.toString()}`
    );
    const results = differencesFile({
      oldFile: { index: oldIndex, archive: oldArchive, file: oldFile },
    });
    archiveDifferences[fileKey] = archiveDifferences[fileKey]
      ? { ...archiveDifferences[fileKey], ...results }
      : results;
  });

  return archiveDifferences;
};

export default differencesCache;
