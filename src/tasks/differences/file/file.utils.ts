import _ from "underscore";

import compareAnimations from "./content/animations";
import compareAreas from "./content/area";
import compareDBRows from "./content/dbrows";
import compareEnums from "./content/enums";
import compareItems from "./content/items";
import compareNpcs from "./content/npcs";
import compareObjects from "./content/objects";
import compareParams from "./content/params";
import compareSpotAnim from "./content/spotanim";
import compareSprites from "./content/sprites";
import compareStructs from "./content/struct";
import compareVarbit from "./content/varbit";
import compareVarplayer from "./content/varplayer";
import {
  ChangedResult,
  ResultValue,
  Result,
  FileDifferences,
  CompareFn,
} from "../differences.types";

import { IndexType, ConfigType } from "@/utils/cache2";
import { PerFileLoadable } from "@/utils/cache2/Loadable";

/**
 * A map of index and archive types to decoding functions.
 */
export const indexMap: {
  [key in IndexType]?: { [key: number]: CompareFn } | CompareFn;
} = {
  [IndexType.Configs]: {
    [ConfigType.Sequence]: compareAnimations,
    [ConfigType.Area]: compareAreas,
    [ConfigType.DbRow]: compareDBRows,
    [ConfigType.Enum]: compareEnums,
    [ConfigType.Item]: compareItems,
    [ConfigType.Npc]: compareNpcs,
    [ConfigType.Object]: compareObjects,
    [ConfigType.Params]: compareParams,
    [ConfigType.SpotAnim]: compareSpotAnim,
    [ConfigType.Struct]: compareStructs,
    [ConfigType.VarBit]: compareVarbit,
    [ConfigType.VarPlayer]: compareVarplayer,
  },
  [IndexType.Sprites]: compareSprites,
};

/**
 * Retrieve the ChangedResult from two file entries
 * @param oldEntry The old file
 * @param newEntry The new file
 */
export const getChangedResult = <T extends PerFileLoadable>(
  oldEntry: T,
  newEntry: T
) => {
  const changed: ChangedResult = {};
  Object.keys(oldEntry).forEach((key) => {
    const oldEntryValue = oldEntry[key as keyof T] as ResultValue;
    const newEntryValue = newEntry[key as keyof T] as ResultValue;
    const isOldArray = Array.isArray(oldEntryValue);
    const isNewArray = Array.isArray(newEntryValue);

    if (
      ((typeof oldEntryValue === "string" ||
        typeof newEntryValue === "string" ||
        typeof oldEntryValue === "number" ||
        typeof newEntryValue === "number") &&
        oldEntryValue !== newEntryValue) ||
      (isOldArray &&
        isNewArray &&
        (_.difference<any>(oldEntryValue, newEntryValue).length > 0 ||
          _.difference<any>(newEntryValue, oldEntryValue).length > 0)) ||
      (isOldArray && !isNewArray) ||
      (isNewArray && !isOldArray)
    ) {
      changed[key] = {
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
        changed[key] = {
          oldValue: Object.fromEntries(oldEntryValue),
          newValue: Object.fromEntries(newEntryValue),
        };
    } else if (oldEntryValue instanceof Map) {
      changed[key] = {
        oldValue: Object.fromEntries(oldEntryValue),
        newValue: "",
      };
    } else if (newEntryValue instanceof Map) {
      changed[key] = {
        oldValue: "",
        newValue: Object.fromEntries(newEntryValue),
      };
    }
  });
  if ("id" in oldEntry && "id" in newEntry) {
    changed["id"] = {
      oldValue: oldEntry.id as number,
      newValue: newEntry.id as number,
    };
  }
  if ("name" in oldEntry && "name" in newEntry) {
    changed["name"] = {
      oldValue: oldEntry.name as string,
      newValue: newEntry.name as string,
    };
  }
  return changed;
};

/**
 * Get a Result from a file
 * @param entry The file
 * @returns A generated Result
 */
export const getFileResult = <T extends PerFileLoadable>(entry: T) => {
  const result: Result = {};
  Object.keys(entry).forEach((key) => {
    const newEntryValue = entry[key as keyof T] as ResultValue;
    result[key] =
      newEntryValue instanceof Map
        ? Object.fromEntries(newEntryValue)
        : newEntryValue;
  });
  return result;
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
    results.changed = getChangedResult(oldEntry, newEntry);
  } else if (oldEntry) {
    results.removed = getFileResult(oldEntry);
  } else if (newEntry) {
    results.added = getFileResult(newEntry);
  }

  return results;
};
