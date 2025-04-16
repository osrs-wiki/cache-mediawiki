import { Param, ParamID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareParams: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Param.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <ParamID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Param.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <ParamID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareParams;
