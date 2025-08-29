import _ from "underscore";

import {
  DecodableWithGameVal,
  Decoder,
  ParentArchiveDecoder,
} from "./file.types";
import {
  ChangedResult,
  ResultValue,
  Result,
  FileDifferences,
  CompareFn,
} from "../differences.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  Reader,
  GameVal,
  Animation,
  AnimationID,
  Area,
  AreaID,
  DBRow,
  DBRowID,
  Enum,
  EnumID,
  Item,
  ItemID,
  NPC,
  NPCID,
  Obj,
  ObjID,
  Param,
  ParamID,
  SpotAnim,
  SpotAnimID,
  Sprites,
  SpriteID,
  Struct,
  StructID,
  Varbit,
  VarbitID,
  VarPlayer,
  VarPID,
  Widget,
  GameValType,
} from "@/utils/cache2";
import { Loadable, PerFileLoadable } from "@/utils/cache2/Loadable";

/**
 * A map of index and archive types to decoding functions.
 */
export const indexMap: {
  [key in IndexType]?: { [key: number]: CompareFn } | CompareFn;
} = {
  [IndexType.Configs]: {
    [ConfigType.Sequence]: createCompareFunction<Animation, AnimationID>(
      Animation
    ),
    [ConfigType.Area]: createSimpleCompareFunction<Area, AreaID>(Area),
    [ConfigType.DbRow]: createSimpleCompareFunction<DBRow, DBRowID>(DBRow),
    [ConfigType.Enum]: createCompareFunction<Enum, EnumID>(Enum),
    [ConfigType.Item]: createCompareFunction<Item, ItemID>(Item),
    [ConfigType.Npc]: createCompareFunction<NPC, NPCID>(NPC),
    [ConfigType.Object]: createCompareFunction<Obj, ObjID>(Obj),
    [ConfigType.Params]: createSimpleCompareFunction<Param, ParamID>(Param),
    [ConfigType.SpotAnim]: createCompareFunction<SpotAnim, SpotAnimID>(
      SpotAnim
    ),
    [ConfigType.Struct]: createSimpleCompareFunction<Struct, StructID>(Struct),
    [ConfigType.VarBit]: createSimpleCompareFunction<Varbit, VarbitID>(Varbit),
    [ConfigType.VarPlayer]: createSimpleCompareFunction<VarPlayer, VarPID>(
      VarPlayer
    ),
  },
  [IndexType.Interfaces]: createArchiveParentCompareFunction<Widget>(Widget),
  [IndexType.Sprites]: createArchiveCompareFunction<Sprites, SpriteID>(Sprites),
};

/**
 * Creates a generic compare function for cache entries that need GameVal lookup
 * @param decoder The decoder class with a static decode method
 * @returns A CompareFn that can be used in the indexMap
 */
export function createCompareFunction<T extends DecodableWithGameVal, ID>(
  decoder: Decoder<T, ID>
): CompareFn {
  return async ({ oldFile, newFile }) => {
    const oldEntry = oldFile
      ? decoder.decode(
          new Reader(oldFile.file.data, {
            era: "osrs",
            indexRevision: oldFile.index.revision,
          }),
          oldFile.file.id as ID
        )
      : undefined;

    if (oldEntry) {
      oldEntry.gameVal = await GameVal.nameFor(
        Context.oldCacheProvider,
        oldEntry
      );
    }

    const newEntry = newFile
      ? decoder.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          newFile.file.id as ID
        )
      : undefined;

    if (newEntry) {
      newEntry.gameVal = await GameVal.nameFor(
        Context.newCacheProvider,
        newEntry
      );
    }

    return getFileDifferences(oldEntry, newEntry);
  };
}

/**
 * Creates a simple compare function for cache entries that don't need GameVal lookup
 * @param decoder The decoder class with a static decode method
 * @returns A CompareFn that can be used in the indexMap
 */
export function createSimpleCompareFunction<T, ID>(decoder: {
  decode(reader: Reader, id: ID): T;
}): CompareFn {
  return async ({ oldFile, newFile }) => {
    const oldEntry = oldFile
      ? decoder.decode(
          new Reader(oldFile.file.data, {
            era: "osrs",
            indexRevision: oldFile.index.revision,
          }),
          oldFile.file.id as ID
        )
      : undefined;

    const newEntry = newFile
      ? decoder.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          newFile.file.id as ID
        )
      : undefined;

    return getFileDifferences(oldEntry, newEntry);
  };
}

/**
 * Creates a compare function for cache entries that use archive.archive instead of file.id
 * @param decoder The decoder class with a static decode method
 * @returns A CompareFn that can be used for archive-based comparisons (like sprites)
 */
export function createArchiveCompareFunction<
  T extends DecodableWithGameVal,
  ID
>(decoder: Decoder<T, ID>): CompareFn {
  return async ({ oldFile, newFile }) => {
    const oldEntry = oldFile
      ? decoder.decode(
          new Reader(oldFile.file.data, {
            era: "osrs",
            indexRevision: oldFile.index.revision,
          }),
          oldFile.archive.archive as ID
        )
      : undefined;

    if (oldEntry) {
      oldEntry.gameVal = await GameVal.nameFor(
        Context.oldCacheProvider,
        oldEntry
      );
    }

    const newEntry = newFile
      ? decoder.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          newFile.archive.archive as ID
        )
      : undefined;

    if (newEntry) {
      newEntry.gameVal = await GameVal.nameFor(
        Context.newCacheProvider,
        newEntry
      );
    }

    return getFileDifferences(oldEntry, newEntry);
  };
}

/**
 * Creates a compare function for PerArchiveParentLoadable entries
 * Loads entire archives with parent-child relationships and compares them as single units
 * @param loadableClass The PerArchiveParentLoadable class with static methods
 * @returns A CompareFn that can be used for archive-based comparisons
 */
export function createArchiveParentCompareFunction<
  T extends DecodableWithGameVal
>(decoder: ParentArchiveDecoder<T>): CompareFn {
  return async ({ oldFile, newFile }) => {
    // We only process one file per archive (typically file 0, the parent)
    // Skip processing if this isn't the first file in the archive
    if (
      (oldFile && oldFile.file.id !== 0) ||
      (newFile && newFile.file.id !== 0)
    ) {
      return {};
    }

    const archiveId = oldFile?.archive.archive ?? newFile?.archive.archive;
    if (archiveId === undefined) {
      return {};
    }

    // Load the complete archive with parent-child structure
    const oldResult = oldFile
      ? await decoder.loadDataWithChildren(Context.oldCacheProvider, archiveId)
      : undefined;
    const newResult = newFile
      ? await decoder.loadDataWithChildren(Context.newCacheProvider, archiveId)
      : undefined;

    const oldEntry = oldResult?.parent;
    const newEntry = newResult?.parent;

    if (oldEntry) {
      oldEntry.gameVal = await GameVal.nameFor(
        Context.oldCacheProvider,
        oldEntry
      );
    }

    if (newEntry) {
      newEntry.gameVal = await GameVal.nameFor(
        Context.newCacheProvider,
        newEntry
      );
    }

    console.log(
      `Old result: ${JSON.stringify(oldEntry)} oldFile: ${oldFile?.file?.id}`
    );
    console.log(
      `New result: ${JSON.stringify(newEntry)} newFile: ${newFile.file.id}`
    );

    return getFileDifferences(oldEntry, newEntry);
  };
}

/**
 * Retrieve the ChangedResult from two file entries
 * @param oldEntry The old file
 * @param newEntry The new file
 */
export const getChangedResult = <T extends Loadable>(
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
        (_.difference<unknown>(oldEntryValue, newEntryValue).length > 0 ||
          _.difference<unknown>(newEntryValue, oldEntryValue).length > 0)) ||
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
  if ("gameVal" in oldEntry && "gameVal" in newEntry) {
    changed["gameVal"] = {
      oldValue: oldEntry.gameVal as string,
      newValue: newEntry.gameVal as string,
    };
  }
  return changed;
};

/**
 * Get a Result from a file
 * @param entry The file
 * @returns A generated Result
 */
export const getFileResult = <T extends Loadable>(entry: T) => {
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
export const getFileDifferences = <T extends Loadable>(
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
