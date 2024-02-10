import _ from "underscore";

import compareItems from "./content/items";
import compareNpcs from "./content/npcs";
import compareObjects from "./content/objects";
import compareStructs from "./content/struct";
import { ConfigType, IndexType, Params } from "../../../utils/cache2";
import { PerFileLoadable } from "../../../utils/cache2/Loadable";
import { CompareFn, FileDifferences, ResultValue } from "../differences.types";

const indexMap: {
  [key in IndexType]?: { [key: number]: CompareFn } | CompareFn;
} = {
  [IndexType.Configs]: {
    [ConfigType.Item]: compareItems,
    [ConfigType.Npc]: compareNpcs,
    [ConfigType.Object]: compareObjects,
    [ConfigType.Struct]: compareStructs,
  },
};

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
      } else if (
        oldEntryValue instanceof Params &&
        newEntryValue instanceof Params
      ) {
        /*const oldKeys = Array.from(oldEntryValue.keys());
        const newKeys = Array.from(newEntryValue.keys());

        const addedKeys = newKeys.filter((key) => !oldKeys.includes(key));
        const removedKeys = oldKeys.filter((key) => !newKeys.includes(key));
        const sharedKeys = newKeys.filter(key => oldKeys.includes(key));*/
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
      results.removed[key] = oldEntryValue;
    });
  } else if (newEntry) {
    results.added = {};
    Object.keys(newEntry).forEach((key) => {
      const newEntryValue = newEntry[key as keyof T] as ResultValue;
      results.added[key] = newEntryValue;
    });
  }

  return results;
};

export default differencesFile;
