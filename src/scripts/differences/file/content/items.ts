import _ from "underscore";

import Context from "../../../../context";
import { Item, ItemID, Reader } from "../../../../utils/cache2";
import { buildItemInfobox } from "../../../infoboxGenernator/infoboxes/item";
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

  if (
    Context.infoboxes &&
    !oldEntry &&
    newEntry.name.toLocaleLowerCase() !== "null"
  ) {
    buildItemInfobox(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareItems;
