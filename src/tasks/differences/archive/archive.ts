import { ArchiveDifferences } from "../differences.types";
import { isEqualBytes } from "../differences.utils";
import { differencesFile } from "../file";

import { ArchiveData, DiskIndexData, FlatIndexData } from "@/utils/cache2";

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
        try {
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
        } catch (error) {
          console.error(
            `Error checking diffs for ${newIndex.id}/${newArchive.archive}/${fileKey} (added file)`
          );
        }
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

export default differencesArchive;
