import { DBRow, Reader } from "@abextm/cache2";
import type { DBRowID } from "@abextm/cache2";
import _ from "underscore";

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
