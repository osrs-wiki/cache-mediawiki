import _ from "underscore";

import { Obj, ObjID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file";

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
