import Context from "../../../context";
import { ArchiveDifferences } from "../differences.types";
import { isEqualBytes } from "../differences.utils";
import { differencesFile } from "../file";

import {
  ArchiveFile,
  ArchiveData,
  DiskIndexData,
  FlatIndexData,
  GameValType,
  IndexType,
  RegionMapper,
} from "@/utils/cache2";

/**
 * Retrieve the differences between two archives and their files
 * @returns {ArchiveDifferences}
 */
const differencesArchive = async ({
  oldIndex,
  oldArchive,
  newIndex,
  newArchive,
  forcedGameValArchive,
}: {
  oldIndex?: FlatIndexData | DiskIndexData;
  oldArchive?: ArchiveData;
  newIndex?: FlatIndexData | DiskIndexData;
  newArchive?: ArchiveData;
  forcedGameValArchive?: GameValType;
}): Promise<ArchiveDifferences> => {
  const archiveDifferences: ArchiveDifferences = {};

  const oldGameValArchive =
    forcedGameValArchive !== undefined
      ? await Context.oldCacheProvider.getArchive(
          IndexType.GameVals,
          forcedGameValArchive
        )
      : undefined;
  const newGameValArchive =
    forcedGameValArchive !== undefined
      ? await Context.newCacheProvider.getArchive(
          IndexType.GameVals,
          forcedGameValArchive
        )
      : undefined;
  const includeGameValOnlyTables =
    forcedGameValArchive === GameValType.DBTables;
  const newKeys = Array.from(
    new Set([
      ...(newArchive ? Array.from(newArchive.files.keys()) : []),
      ...(includeGameValOnlyTables && newGameValArchive
        ? Array.from(newGameValArchive.files.keys())
        : []),
    ])
  );
  const oldKeys = Array.from(
    new Set([
      ...(oldArchive ? Array.from(oldArchive.files.keys()) : []),
      ...(includeGameValOnlyTables && oldGameValArchive
        ? Array.from(oldGameValArchive.files.keys())
        : []),
    ])
  );
  const comparisonFileFor = (
    archive: ArchiveData | undefined,
    gameValArchive: ArchiveData | undefined,
    fileKey: number
  ) => {
    const file = archive?.files.has(fileKey)
      ? archive.getFile(fileKey)
      : undefined;
    if (file) {
      return file;
    }
    if (includeGameValOnlyTables && gameValArchive?.files.has(fileKey)) {
      const schemaLightFile = new ArchiveFile(fileKey, 0);
      schemaLightFile.data = new Uint8Array([0]);
      return schemaLightFile;
    }
    return undefined;
  };

  if (newIndex?.id === IndexType.Maps) {
    const regionInfo = RegionMapper.getRegionFromArchiveId(newArchive.namehash);
    if (regionInfo?.type === "locations") {
      Context.newCacheProvider
        .getKeys()
        .tryDecrypt(newArchive, regionInfo.regionId);
      if (oldArchive) {
        Context.oldCacheProvider
          .getKeys()
          .tryDecrypt(oldArchive, regionInfo.regionId);
      }
    }
  }

  if (newArchive && oldArchive) {
    const sharedKeys = newKeys.filter((key) =>
      comparisonFileFor(oldArchive, oldGameValArchive, key)
    );
    await Promise.all(
      sharedKeys.map(async (fileKey) => {
        try {
          const newFile = comparisonFileFor(
            newArchive,
            newGameValArchive,
            fileKey
          );
          const oldFile = comparisonFileFor(
            oldArchive,
            oldGameValArchive,
            fileKey
          );
          if (!oldFile || !newFile) {
            return;
          }
          let gameValChanged = false;

          if (forcedGameValArchive !== undefined) {
            const oldGameValFile = oldGameValArchive?.files.has(fileKey)
              ? oldGameValArchive.getFile(fileKey)
              : undefined;
            const newGameValFile = newGameValArchive?.files.has(fileKey)
              ? newGameValArchive.getFile(fileKey)
              : undefined;
            if (oldGameValFile && newGameValFile) {
              gameValChanged = !isEqualBytes(
                oldGameValFile.data,
                newGameValFile.data
              );
            } else {
              gameValChanged = !!oldGameValFile !== !!newGameValFile;
            }
          }

          if (!isEqualBytes(oldFile.data, newFile.data) || gameValChanged) {
            console.log(
              `[Index=${newArchive.index}][Archive=${newArchive.archive}] Changed file: ${newFile.id}`
            );

            const results = await differencesFile({
              oldFile: { index: oldIndex, archive: oldArchive, file: oldFile },
              newFile: { index: newIndex, archive: newArchive, file: newFile },
            });

            archiveDifferences[fileKey] = results;
          }
        } catch (error) {
          console.error(
            `Error checking diffs for ${oldIndex.id}/${oldArchive.archive}/${fileKey}`,
            error
          );
        }
      })
    );
  }

  const addedKeys = oldArchive
    ? newKeys.filter(
        (key) => !comparisonFileFor(oldArchive, oldGameValArchive, key)
      )
    : newKeys;
  if (addedKeys) {
    await Promise.all(
      addedKeys.map(async (fileKey) => {
        try {
          const newFile = comparisonFileFor(
            newArchive,
            newGameValArchive,
            fileKey
          );
          if (!newFile) {
            return;
          }
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
            `Error checking diffs for ${newIndex.id}/${newArchive.archive}/${fileKey} (added file):`,
            error
          );
        }
      })
    );
  }

  const removedKeys = newArchive
    ? oldKeys.filter(
        (key) => !comparisonFileFor(newArchive, newGameValArchive, key)
      )
    : oldKeys;
  if (removedKeys) {
    await Promise.all(
      removedKeys.map(async (fileKey) => {
        const oldFile = comparisonFileFor(
          oldArchive,
          oldGameValArchive,
          fileKey
        );
        if (!oldFile) {
          return;
        }
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
