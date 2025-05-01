import { writeItemPage } from "../../../pages/types";
import { renderItems } from "../../../renders";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

import Context from "@/context";
import { GameVal, Item, ItemID, Reader } from "@/utils/cache2";

const compareItems: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Item.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <ItemID>oldFile.file.id
      )
    : undefined;
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(
      Context.oldCacheProvider,
      oldEntry
    );
  }

  const newEntry = newFile
    ? Item.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <ItemID>newFile.file.id
      )
    : undefined;
  if (newEntry) {
    newEntry.gameVal = await GameVal.nameFor(
      Context.newCacheProvider,
      newEntry
    );
  }

  if (
    Context.pages &&
    !oldEntry &&
    newEntry.name.toLocaleLowerCase() !== "null"
  ) {
    writeItemPage(newEntry);
  }

  if (Context.renders && newEntry) {
    renderItems(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareItems;
