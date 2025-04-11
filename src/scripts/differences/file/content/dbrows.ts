import Context from "../../../../context";
import { DBRow, DBRowID, GameVal, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

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
  oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, oldEntry);

  const newEntry = newFile
    ? DBRow.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <DBRowID>newFile.file.id
      )
    : undefined;
  newEntry.gameVal = await GameVal.nameFor(Context.newCacheProvider, newEntry);

  return getFileDifferences(oldEntry, newEntry);
};

export default compareDBRows;
