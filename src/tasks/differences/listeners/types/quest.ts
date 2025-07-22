import { writeQuestPage, questRowToQuest } from "../../../pages/types";
import { CacheChangeListener } from "../listeners.types";

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
        const quest = questRowToQuest(newEntry);
        if (quest) {
          writeQuestPage(quest);
        }
      } catch (error) {
        console.error(`Error processing quest ${newFile.file.id}:`, error);
      }
    }
  },
};
