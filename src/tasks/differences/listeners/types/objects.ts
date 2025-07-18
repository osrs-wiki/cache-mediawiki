import { writeSceneryPage } from "../../../pages/types";
import { renderScenery } from "../../../renders/scenery";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  GameVal,
  Obj,
  ObjID,
  Reader,
} from "@/utils/cache2";

export const objectListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.Object,
  handler: async ({ oldFile, newFile }) => {
    const oldEntry = oldFile
      ? Obj.decode(
          new Reader(oldFile.file.data, {
            era: "osrs",
            indexRevision: oldFile.index.revision,
          }),
          <ObjID>oldFile.file.id
        )
      : undefined;
    if (oldEntry) {
      oldEntry.gameVal = await GameVal.nameFor(
        Context.oldCacheProvider,
        oldEntry
      );
    }

    const newEntry = newFile
      ? Obj.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          <ObjID>newFile.file.id
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
      writeSceneryPage(newEntry);
    }

    if (Context.renders && newEntry) {
      renderScenery(newEntry);
    }
  },
};
