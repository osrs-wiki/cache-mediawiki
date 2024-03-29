import _ from "underscore";

import { Reader, Struct, StructID } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

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

  return getFileDifferences(oldEntry, newEntry);
};

export default compareStructs;
