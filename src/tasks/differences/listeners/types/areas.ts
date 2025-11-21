import { writeAreaPage } from "../../../pages/types";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import { IndexType, ConfigType, Area, AreaID, Reader } from "@/utils/cache2";

export const areaListener: CacheChangeListener = {
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
      newEntry.name.toLowerCase() !== "null"
    ) {
      writeAreaPage(newEntry, Promise.resolve(Context.newCacheProvider));
    }
  },
};
