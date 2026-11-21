import { writeQuestPage } from "../../../pages/types";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import { ConfigType, DBRow, DBRowID, IndexType, Reader } from "@/utils/cache2";

export const questListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.DbRow,
  handler: async ({ oldFile, newFile }) => {
    const newEntry = newFile
      ? DBRow.decode(
          new Reader(newFile.file.data, {
            era: "osrs",
            indexRevision: newFile.index.revision,
          }),
          <DBRowID>newFile.file.id
        )
      : undefined;

    if (Context.pages && !oldFile && newEntry?.table === 0) {
      await writeQuestPage(Promise.resolve(Context.newCacheProvider), newEntry);
    }
  },
};
