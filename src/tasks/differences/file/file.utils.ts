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
} from "@/utils/cache2";
import { Loadable, PerArchiveLoadable } from "@/utils/cache2/Loadable";
import { Region } from "@/utils/cache2/loaders/Region";
import { RegionMapper } from "@/utils/cache2/loaders/RegionMapper";
import { RegionX, RegionY } from "@/utils/cache2/types";

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
    [ConfigType.DbRow]: createCompareFunction<DBRow, DBRowID>(DBRow),
    [ConfigType.Enum]: createSimpleCompareFunction<Enum, EnumID>(Enum),
    [ConfigType.Item]: createCompareFunction<Item, ItemID>(Item),
    [ConfigType.Npc]: createCompareFunction<NPC, NPCID>(NPC),
    [ConfigType.Object]: createCompareFunction<Obj, ObjID>(Obj),
    [ConfigType.Params]: createSimpleCompareFunction<Param, ParamID>(Param),
    [ConfigType.SpotAnim]: createCompareFunction<SpotAnim, SpotAnimID>(
      SpotAnim
    ),
    [ConfigType.Struct]: createSimpleCompareFunction<Struct, StructID>(Struct),
    [ConfigType.VarBit]: createCompareFunction<Varbit, VarbitID>(Varbit),
    [ConfigType.VarPlayer]: createCompareFunction<VarPlayer, VarPID>(VarPlayer),
  },
  [IndexType.Interfaces]: createArchiveParentCompareFunction<Widget>(Widget),
  [IndexType.Maps]: createRegionCompareFunction(),
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
  T extends DecodableWithGameVal | PerArchiveLoadable,
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

    if (oldEntry && "gameVal" in oldEntry) {
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

    if (newEntry && "gameVal" in newEntry) {
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

/**
 * Helper function to load a Region from map and location data.
 * Handles XTEA decryption for location data when needed.
 */
async function loadRegionFromFiles(
  regionX: RegionX,
  regionY: RegionY,
  cacheProvider: unknown,
  locationData?: Uint8Array,
  mapData?: Uint8Array
): Promise<Region> {
  // Convert Uint8Array to Buffer if needed
  const mapBuffer = mapData ? Buffer.from(mapData) : undefined;
  const locationBuffer = locationData ? Buffer.from(locationData) : undefined;

  // For now, create a simple Region using the create method
  // This will need to be updated based on the actual Region.create implementation
  return Region.create(regionX, regionY, mapBuffer, locationBuffer);
}

/**
 * Creates a compare function for region data that handles both map and location archives.
 * Regions work differently than other cache entries as they combine data from multiple archives
 * and require RegionMapper to resolve archive IDs to coordinates.
 */
export function createRegionCompareFunction(): CompareFn {
  return async ({ oldFile, newFile }) => {
    const results: FileDifferences = {};

    const archiveId =
      oldFile?.archive.archive || newFile?.archive.archive || -1;

    // Use RegionMapper to get region coordinates from archive ID
    const regionInfo = await RegionMapper.getRegionFromArchiveId(archiveId);
    if (!regionInfo) {
      // Archive ID doesn't correspond to a valid region, treat as generic file
      const oldData = oldFile?.file.data;
      const newData = newFile?.file.data;

      if (oldData && newData) {
        const isSame = Buffer.compare(oldData, newData) === 0;
        if (!isSame) {
          results.changed = {
            [`archive_${archiveId}`]: {
              oldValue: `Binary data (${oldData.length} bytes)`,
              newValue: `Binary data (${newData.length} bytes)`,
            },
          };
        }
      } else if (oldData && !newData) {
        results.removed = {
          [`archive_${archiveId}`]: `Binary data (${oldData.length} bytes)`,
        };
      } else if (!oldData && newData) {
        results.added = {
          [`archive_${archiveId}`]: `Binary data (${newData.length} bytes)`,
        };
      }

      return results;
    }

    const { regionX, regionY, type } = regionInfo;

    try {
      // Load the old region data
      const oldRegion = oldFile
        ? await loadRegionFromFiles(
            regionX,
            regionY,
            Context.oldCacheProvider,
            type === "locations" ? oldFile.file.data : undefined,
            type === "map" ? oldFile.file.data : undefined
          )
        : undefined;

      // Load the new region data
      const newRegion = newFile
        ? await loadRegionFromFiles(
            regionX,
            regionY,
            Context.newCacheProvider,
            type === "locations" ? newFile.file.data : undefined,
            type === "map" ? newFile.file.data : undefined
          )
        : undefined;

      // Set GameVal names for both regions
      if (oldRegion) {
        oldRegion.gameVal = await GameVal.nameFor(
          Context.oldCacheProvider,
          oldRegion
        );
      }

      if (newRegion) {
        newRegion.gameVal = await GameVal.nameFor(
          Context.newCacheProvider,
          newRegion
        );
      }

      return getFileDifferences(oldRegion, newRegion);
    } catch (error) {
      console.warn(
        `Error processing region ${regionX},${regionY} from archive ${archiveId}:`,
        error
      );
      // Fall back to binary comparison
      const oldData = oldFile?.file.data;
      const newData = newFile?.file.data;

      if (oldData && newData) {
        const isSame = Buffer.compare(oldData, newData) === 0;
        if (!isSame) {
          results.changed = {
            [`region_${regionX}_${regionY}_error`]: {
              oldValue: `Binary data (${oldData.length} bytes)`,
              newValue: `Binary data (${newData.length} bytes)`,
            },
          };
        }
      } else if (oldData && !newData) {
        results.removed = {
          [`region_${regionX}_${regionY}_error`]: `Binary data (${oldData.length} bytes)`,
        };
      } else if (!oldData && newData) {
        results.added = {
          [`region_${regionX}_${regionY}_error`]: `Binary data (${newData.length} bytes)`,
        };
      }

      return results;
    }
  };
}
