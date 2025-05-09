import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

import { Enum, EnumID, Reader } from "@/utils/cache2";

const compareEnums: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Enum.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <EnumID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Enum.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <EnumID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareEnums;
