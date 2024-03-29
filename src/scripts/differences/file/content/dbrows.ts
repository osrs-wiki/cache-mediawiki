import _ from "underscore";

import { DBRow, DBRowID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareDBRows: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? DBRow.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <DBRowID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? DBRow.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <DBRowID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareDBRows;
