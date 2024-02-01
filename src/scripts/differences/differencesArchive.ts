import { isEqualBytes } from "./differences.utils";
import { ArchiveData } from "../../utils/cache2";

const differencesArchive = (
  oldArchive: ArchiveData,
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

export default differencesArchive;
