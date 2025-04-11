import Context from "../../../../context";
import { GameVal, Reader, Varbit, VarbitID } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareVarbit: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Varbit.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <VarbitID>oldFile.file.id
      )
    : undefined;
  oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, oldEntry);

  const newEntry = newFile
    ? Varbit.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <VarbitID>newFile.file.id
      )
    : undefined;
  newEntry.gameVal = await GameVal.nameFor(Context.newCacheProvider, newEntry);

  return getFileDifferences(oldEntry, newEntry);
};

export default compareVarbit;
