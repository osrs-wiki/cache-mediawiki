import _ from "underscore";

import { Item, ItemID, Reader } from "../../../../utils/cache2";
import { CompareFn, FileDifferences } from "../../differences.types";

const compareItems: CompareFn = ({ oldFile, newFile }) => {
  const oldItem = Item.decode(
    new Reader(oldFile.file.data, {
      era: "osrs",
      indexRevision: oldFile.index.revision,
    }),
    <ItemID>oldFile.file.id
  );

  const newItem = Item.decode(
    new Reader(newFile.file.data, {
      era: "osrs",
      indexRevision: newFile.index.revision,
    }),
    <ItemID>newFile.file.id
  );

  const results: FileDifferences = {};
  Object.keys(oldItem).forEach((key) => {
    const oldItemValue = oldItem[key as keyof Item];
    const newItemValue = newItem[key as keyof Item];

    if (
      ((typeof oldItemValue === "string" || typeof oldItemValue === "number") &&
        oldItemValue !== newItemValue) ||
      (Array.isArray(oldItemValue) &&
        Array.isArray(newItemValue) &&
        _.difference<any>(oldItemValue, newItemValue).length > 0)
    ) {
      results[key] = {
        changed: {
          oldValue: oldItemValue,
          newValue: newItemValue,
        },
      };
    }
  });

  return results;
};

export default compareItems;
