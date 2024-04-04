import compareDBRows from "./content/dbrows";
import compareEnums from "./content/enums";
import compareItems from "./content/items";
import compareNpcs from "./content/npcs";
import compareObjects from "./content/objects";
import compareParams from "./content/params";
import compareStructs from "./content/struct";
import { IndexType, ConfigType } from "../../../utils/cache2";
import { CompareFn, FileDifferences } from "../differences.types";

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
    try {
      results = comparisonFn?.({ oldFile, newFile }) ?? {};
    } catch (error) {
      console.error(
        `Error decoding [index=${indexId}][archive=${archiveId}][file=${newFile.file.id}]`,
        error
      );
    }
  }
  return results;
};

export default differencesFile;
