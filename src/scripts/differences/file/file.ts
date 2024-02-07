import compareItems from "./content/items";
import compareNpcs from "./content/npcs";
import compareStructs from "./content/struct";
import { ConfigType, IndexType } from "../../../utils/cache2";
import { CompareFn, FileDifferences } from "../differences.types";

const indexMap: {
  [key in IndexType]?: { [key: number]: CompareFn } | CompareFn;
} = {
  [IndexType.Configs]: {
    [ConfigType.Item]: compareItems,
    [ConfigType.Npc]: compareNpcs,
    [ConfigType.Struct]: compareStructs,
  },
};

const differencesFile: CompareFn = ({ oldFile, newFile }): FileDifferences => {
  let comparisonFn = indexMap[oldFile.index.id as IndexType];
  let results: FileDifferences = {};
  if (typeof comparisonFn === "function") {
    results = comparisonFn({ oldFile, newFile });
  } else {
    comparisonFn = comparisonFn?.[oldFile.archive.archive];
    results = comparisonFn?.({ oldFile, newFile }) ?? {};
  }
  return results;
};

export default differencesFile;
