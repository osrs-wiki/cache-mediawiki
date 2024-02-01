import differencesArchive from "./differencesArchive";
import { FlatIndexData } from "../../utils/cache2";

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
      differencesArchive(oldArchive, newArchive);
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

export default differencesIndex;
