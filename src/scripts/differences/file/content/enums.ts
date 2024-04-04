import { Enum, Reader } from "@abextm/cache2";
import type { EnumID } from "@abextm/cache2";
import _ from "underscore";

import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareEnums: CompareFn = ({ oldFile, newFile }) => {
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
