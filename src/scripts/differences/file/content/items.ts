import { Item, ItemID, Reader } from "../../../../utils/cache2";
import { ComaparisonResult, CompareFn } from "../file.types";

const compareItems: CompareFn = (oldFile, newFile) => {
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

  const results: ComaparisonResult = {};
  Object.keys(oldItem).forEach((key) => {
    const oldItemValue = oldItem[key as keyof Item];
    const newItemValue = newItem[key as keyof Item];
    if (Array.isArray(oldItemValue) && Array.isArray(newItemValue)) {
    } else if (
      typeof oldItemValue === "string" ||
      (typeof oldItemValue === "number" && oldItemValue !== newItemValue)
    ) {
      results[key] = {
        oldValue: oldItemValue,
        newValue: newItemValue,
      };
    }
  });

  return results;
};

export default compareItems;
