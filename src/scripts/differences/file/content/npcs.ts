import _ from "underscore";

import { NPC, NPCID, Reader } from "../../../../utils/cache2";
import { CompareFn, FileDifferences } from "../../differences.types";

const compareNpcs: CompareFn = ({ oldFile, newFile }) => {
  const oldItem = NPC.decode(
    new Reader(oldFile.file.data, {
      era: "osrs",
      indexRevision: oldFile.index.revision,
    }),
    <NPCID>oldFile.file.id
  );

  const newItem = NPC.decode(
    new Reader(newFile.file.data, {
      era: "osrs",
      indexRevision: newFile.index.revision,
    }),
    <NPCID>newFile.file.id
  );

  const results: FileDifferences = {};
  Object.keys(oldItem).forEach((key) => {
    const oldItemValue = oldItem[key as keyof NPC];
    const newItemValue = newItem[key as keyof NPC];

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

export default compareNpcs;
