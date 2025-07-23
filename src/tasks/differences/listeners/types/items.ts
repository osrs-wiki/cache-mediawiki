import { writeItemPage } from "../../../pages/types";
import { renderItems } from "../../../renders";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  GameVal,
  Item,
  ItemID,
  Reader,
} from "@/utils/cache2";

export const itemListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.Item,
  handler: async ({ oldFile, newFile }) => {
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
      newEntry &&
      newEntry.name.toLowerCase() !== "null"
    ) {
      writeItemPage(newEntry);
    } else if (Context.renders && newEntry) {
      renderItems(newEntry);
    }
  },
};
