import _ from "underscore";

import compareDBRows from "./content/dbrows";
import compareEnums from "./content/enums";
import compareItems from "./content/items";
import compareNpcs from "./content/npcs";
import compareObjects from "./content/objects";
import compareParams from "./content/params";
import compareStructs from "./content/struct";
import { ConfigType, IndexType } from "../../../utils/cache2";
import { PerFileLoadable } from "../../../utils/cache2/Loadable";
import { CompareFn, FileDifferences, ResultValue } from "../differences.types";

/**
 * A map of index and archive types to decoding functions.
 */
const indexMap: {
  [key in IndexType]?: { [key: number]: CompareFn } | CompareFn;
} = {
  [IndexType.Configs]: {
    [ConfigType.DbRow]: compareDBRows,
    [ConfigType.Enum]: compareEnums,
    [ConfigType.Item]: compareItems,
    [ConfigType.Npc]: compareNpcs,
    [ConfigType.Object]: compareObjects,
    [ConfigType.Params]: compareParams,
    [ConfigType.Struct]: compareStructs,
  },
};

/**
 * Retrieve the file differences between two given files.
 * @params
 * @returns The differences between two files.
 *  If either is undefined the difference will be considered additions or removals.
 */
const differencesFile: CompareFn = ({ oldFile, newFile }): FileDifferences => {
  const indexId = oldFile?.index?.id ?? newFile?.index?.id;
  let comparisonFn = indexMap[indexId as IndexType];
  let results: FileDifferences = {};
  if (typeof comparisonFn === "function") {
    results = comparisonFn({ oldFile, newFile });
  } else {
    const archiveId = oldFile?.archive?.archive ?? newFile?.archive?.archive;
    comparisonFn = comparisonFn?.[archiveId];
    results = comparisonFn?.({ oldFile, newFile }) ?? {};
  }
  return results;
};

/**
 * Retrieve the differences in a file: added, changed, and removed files.
 * @param oldEntry The old file data
 * @param newEntry The new file data
 * @returns {FileDifferences}
 */
export const getFileDifferences = <T extends PerFileLoadable>(
  oldEntry: T,
  newEntry: T
): FileDifferences => {
  const results: FileDifferences = {};
  if (oldEntry && newEntry) {
    results.changed = {};
    Object.keys(oldEntry).forEach((key) => {
      const oldEntryValue = oldEntry[key as keyof T] as ResultValue;
      const newEntryValue = newEntry[key as keyof T] as ResultValue;

      if (
        ((typeof oldEntryValue === "string" ||
          typeof oldEntryValue === "number") &&
          oldEntryValue !== newEntryValue) ||
        (Array.isArray(oldEntryValue) &&
          Array.isArray(newEntryValue) &&
          _.difference<any>(oldEntryValue, newEntryValue).length > 0)
      ) {
        results.changed[key] = {
          oldValue: oldEntryValue,
          newValue: newEntryValue,
        };
      } else if (oldEntryValue instanceof Map && newEntryValue instanceof Map) {
        const oldKeys = Array.from(oldEntryValue.keys());
        const newKeys = Array.from(newEntryValue.keys());

        const addedKeys = newKeys.filter((key) => !oldKeys.includes(key));
        const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));
        const sharedKeys = newKeys.filter((key) => oldKeys.includes(key));
        const changedKeys = sharedKeys.filter(
          (key) => oldEntryValue.get(key) !== newEntryValue.get(key)
        );
        if (
          addedKeys.length > 0 ||
          removedKeys.length > 0 ||
          changedKeys.length > 0
        )
          results.changed[key] = {
            oldValue: Object.fromEntries(oldEntryValue),
            newValue: Object.fromEntries(newEntryValue),
          };
      }
    });
    if ("id" in oldEntry && "id" in newEntry) {
      results.changed["id"] = {
        oldValue: oldEntry.id as number,
        newValue: newEntry.id as number,
      };
    }
    if ("name" in oldEntry && "name" in newEntry) {
      results.changed["name"] = {
        oldValue: oldEntry.name as string,
        newValue: newEntry.name as string,
      };
    }
  } else if (oldEntry) {
    results.removed = {};
    Object.keys(oldEntry).forEach((key) => {
      const oldEntryValue = oldEntry[key as keyof T] as ResultValue;
      results.removed[key] =
        oldEntryValue instanceof Map
          ? Object.fromEntries(oldEntryValue)
          : oldEntryValue;
    });
  } else if (newEntry) {
    results.added = {};
    Object.keys(newEntry).forEach((key) => {
      const newEntryValue = newEntry[key as keyof T] as ResultValue;
      results.added[key] =
        newEntryValue instanceof Map
          ? Object.fromEntries(newEntryValue)
          : newEntryValue;
    });
  }

  return results;
};

export default differencesFile;
