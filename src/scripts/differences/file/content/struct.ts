import _ from "underscore";

import { Params, Reader, Struct, StructID } from "../../../../utils/cache2";
import { CompareFn, FileDifferences } from "../../differences.types";

const compareStructs: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = Struct.decode(
    new Reader(oldFile.file.data, {
      era: "osrs",
      indexRevision: oldFile.index.revision,
    }),
    <StructID>oldFile.file.id
  );

  const newEntry = Struct.decode(
    new Reader(newFile.file.data, {
      era: "osrs",
      indexRevision: newFile.index.revision,
    }),
    <StructID>newFile.file.id
  );

  const results: FileDifferences = {};
  Object.keys(oldEntry).forEach((key) => {
    const oldEntryValue = oldEntry[key as keyof Struct];
    const newEntryValue = newEntry[key as keyof Struct];

    if (
      ((typeof oldEntryValue === "string" ||
        typeof oldEntryValue === "number") &&
        oldEntryValue !== newEntryValue) ||
      (Array.isArray(oldEntryValue) &&
        Array.isArray(newEntryValue) &&
        _.difference<any>(oldEntryValue, newEntryValue).length > 0)
    ) {
      results[key] = {
        changed: {
          oldValue: oldEntryValue,
          newValue: newEntryValue,
        },
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
      results[key] = {
        changed: {
          oldValue: Object.fromEntries(oldEntryValue),
          newValue: Object.fromEntries(newEntryValue),
        },
      };
    }
  });

  return results;
};

export default compareStructs;
