import { Area, AreaID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareAreas: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Area.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <AreaID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Area.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <AreaID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareAreas;
