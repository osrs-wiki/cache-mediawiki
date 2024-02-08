import _ from "underscore";

import { Params, Reader, Struct, StructID } from "../../../../utils/cache2";
import { CompareFn, FileDifferences } from "../../differences.types";

const compareStructs: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Struct.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <StructID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Struct.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <StructID>newFile.file.id
      )
    : undefined;

  const results: FileDifferences = {};
  if (oldEntry && newEntry) {
    results.changed = {};
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
        results.changed[key] = {
          oldValue: oldEntryValue,
          newValue: newEntryValue,
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
        results.changed[key] = {
          oldValue: Object.fromEntries(oldEntryValue),
          newValue: Object.fromEntries(newEntryValue),
        };
      }
    });
  } else if (oldEntry) {
    results.removed = {};
    Object.keys(oldEntry).forEach((key) => {
      const oldEntryValue = oldEntry[key as keyof Struct];
      results.removed[key] = oldEntryValue;
    });
  } else if (newEntry) {
    results.added = {};
    Object.keys(newEntry).forEach((key) => {
      const newEntryValue = newEntry[key as keyof Struct];
      results.added[key] = newEntryValue;
    });
  }

  return results;
};

export default compareStructs;
