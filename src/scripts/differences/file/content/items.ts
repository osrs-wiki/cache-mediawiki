import _ from "underscore";

import { Item, ItemID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file";

const compareItems: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Item.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <ItemID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? Item.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <ItemID>newFile.file.id
      )
    : undefined;

  return getFileDifferences(oldEntry, newEntry);
};

export default compareItems;
