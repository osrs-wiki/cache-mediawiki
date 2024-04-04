import { Obj, Reader } from "@abextm/cache2";
import type { ObjID } from "@abextm/cache2";
import _ from "underscore";

import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareObjects: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Obj.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <ObjID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Obj.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <ObjID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareObjects;
