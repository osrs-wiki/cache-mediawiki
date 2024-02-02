import { isEqualBytes } from "./differences.utils";
import differencesFile from "./file/File";
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

const differencesIndex = (oldIndex: FlatIndexData, newIndex: FlatIndexData) => {
  const newKeys = Array.from(newIndex.archives.keys());
  const oldKeys = Array.from(oldIndex.archives.keys());

  const sharedKeys = newKeys.filter((key) => oldIndex.archives.has(key));
  sharedKeys.forEach((archiveKey) => {
    const newArchive = newIndex.archives.get(archiveKey);
    const oldArchive = oldIndex.archives.get(archiveKey);
    if (newArchive.crc !== oldArchive.crc) {
      console.log(
        `[Index=${newIndex.id}] Changed archive: ${newArchive.archive} - (${oldArchive.files.size} -> ${newArchive.files.size})`
      );
      differencesArchive(oldIndex, oldArchive, newIndex, newArchive);
    }
  });

  const addedKeys = newKeys.filter((key) => !oldIndex.archives.has(key));
  addedKeys.forEach((archiveKey) => {
    const newArchive = newIndex.archives.get(archiveKey);
    console.log(
      `[Index=${newIndex.id}] Added archive: ${newArchive.archive} (${newArchive.files.size} files)`
    );
  });

  const removedKeys = oldKeys.filter((key) => !newIndex.archives.has(key));
  removedKeys.forEach((oldArchive) => {
    console.log(
      `[Index=${newIndex.id}] Removed archive: ${oldArchive.toString()}`
    );
  });
};

const differencesArchive = (
  oldIndex: FlatIndexData,
  oldArchive: ArchiveData,
  newIndex: FlatIndexData,
  newArchive: ArchiveData
) => {
  const newKeys = Array.from(newArchive.files.keys());
  const oldKeys = Array.from(oldArchive.files.keys());

  const sharedKeys = newKeys.filter((key) => oldArchive.files.has(key));
  sharedKeys.forEach((fileKey) => {
    const newFile = newArchive.getFile(fileKey);
    const oldFile = oldArchive.getFile(fileKey);
    if (!isEqualBytes(oldFile.data, newFile.data)) {
      console.log(
        `[Index=${newArchive.index}][Archive=${newArchive.archive}] Changed file: ${newFile.id}`
      );
      differencesFile(
        { index: newIndex, archive: newArchive, file: newFile },
        { index: oldIndex, archive: oldArchive, file: oldFile }
      );
    }
  });

  const addedKeys = newKeys.filter((key) => !oldArchive.files.has(key));
  addedKeys.forEach((fileKey) => {
    const newFile = newArchive.getFile(fileKey);
    console.log(
      `[Index=${newArchive.index}][Archive=${newArchive.archive}] Added file: ${newFile.id}`
    );
  });

  const removedKeys = oldKeys.filter((key) => !newArchive.files.has(key));
  removedKeys.forEach((oldArchive) => {
    console.log(
      `[Index=${newArchive.index}][Archive=${
        newArchive.archive
      }] Removed file: ${oldArchive.toString()}`
    );
  });
};

export default differencesCache;
