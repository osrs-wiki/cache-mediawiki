import { writeMusicPage } from "../../../pages/types";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  DBRow,
  DBRowID,
  Reader,
} from "@/utils/cache2";

export const musicListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.DbRow,
  handler: async ({ oldFile, newFile }) => {
    const oldEntry = oldFile
      ? DBRow.decode(
          new Reader(oldFile.file.data, {
            era: "osrs",
            indexRevision: oldFile.index.revision,
          }),
          <DBRowID>oldFile.file.id
        )
      : undefined;

    const newEntry = newFile
      ? DBRow.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          <DBRowID>newFile.file.id
        )
      : undefined;

    // Only process entries from table 44 (music tracks)
    if (
      Context.pages &&
      !oldEntry &&
      newEntry &&
      newEntry.table === 44
    ) {
      writeMusicPage(newEntry);
    }
  },
};