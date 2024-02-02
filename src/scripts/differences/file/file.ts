import compareItems from "./content/items";
import { ComaparisonResult, CompareFn } from "./file.types";
import { Item } from "../../../utils/cache2";

const indexMap: { [key: number]: { [key: number]: CompareFn } | CompareFn } = {
  2: {
    [Item.archive]: compareItems,
  },
};

const differencesFile: CompareFn = (oldFile, newFile): ComaparisonResult => {
  let comparisonFn = indexMap[oldFile.index.id];
  if (typeof comparisonFn === "function") {
    comparisonFn(oldFile, newFile);
  } else {
    comparisonFn = comparisonFn[oldFile.archive.archive];
    comparisonFn?.(oldFile, newFile);
  }
  return {};
};

export default differencesFile;
