import { Reader, Varbit, VarbitID } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareVarbit: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Varbit.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <VarbitID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Varbit.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <VarbitID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareVarbit;
