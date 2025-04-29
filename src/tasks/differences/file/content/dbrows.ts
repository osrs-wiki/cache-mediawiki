import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

import Context from "@/context";
import { DBRow, DBRowID, GameVal, Reader } from "@/utils/cache2";

const compareDBRows: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? DBRow.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <DBRowID>oldFile.file.id
      )
    : undefined;
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(
      Context.oldCacheProvider,
      oldEntry
    );
  }

  const newEntry = newFile
    ? DBRow.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <DBRowID>newFile.file.id
      )
    : undefined;
  if (newEntry) {
    newEntry.gameVal = await GameVal.nameFor(
      Context.newCacheProvider,
      newEntry
    );
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareDBRows;
