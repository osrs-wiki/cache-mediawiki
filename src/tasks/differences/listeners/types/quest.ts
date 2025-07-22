import { writeQuestPage, questRowToQuest } from "../../../pages/types";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  DBRow,
  DBRowID,
  DBTableID,
  Reader,
} from "@/utils/cache2";

export const questListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.DbRow,
  handler: async ({ newFile }) => {
    if (!newFile) return;

    const newEntry = DBRow.decode(
      new Reader(newFile.file.data, {
        era: "osrs",
        indexRevision: newFile.index.revision,
      }),
      <DBRowID>newFile.file.id
    );

    // Check if this is a quest from table 0
    if (newEntry && newEntry.table === (0 as DBTableID)) {
      try {
        if (!Context.newCacheProvider) {
          console.error("Cache provider not available in Context");
          return;
        }

        const quest = await questRowToQuest(
          newEntry,
          Promise.resolve(Context.newCacheProvider)
        );
        if (quest) {
          await writeQuestPage(quest);
        }
      } catch (error) {
        console.error(`Error processing quest ${newFile.file.id}:`, error);
      }
    }
  },
};
