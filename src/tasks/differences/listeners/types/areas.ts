import { writeAreaPage } from "../../../pages/types";
import { cacheListeners } from "../listeners";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import { IndexType, ConfigType, Area, AreaID, Reader } from "@/utils/cache2";

const areaListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.Area,
  handler: async ({ oldFile, newFile }) => {
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

    if (
      Context.pages &&
      !oldEntry &&
      newEntry &&
      newEntry.name.toLocaleLowerCase() !== "null"
    ) {
      writeAreaPage(newEntry);
    }
  },
};

cacheListeners.push(areaListener);
