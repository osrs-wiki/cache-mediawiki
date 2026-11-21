import { writePageToFile } from "../pages.utils";

import { dbRowToQuest, questPageBuilder } from "@/mediawiki/pages/quest";
import { CacheProvider, DBRow } from "@/utils/cache2";

export const writeQuestPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const dbRow = await DBRow.load(cache, id);
    if (!dbRow) {
      console.warn(`Quest DBRow ${id} was not found.`);
      return;
    }
    if (dbRow.table !== 0) {
      console.warn(
        `DBRow ${id} belongs to table ${dbRow.table}, not the quest table.`
      );
      return;
    }

    await writeQuestPage(cache, dbRow);
  } catch (error) {
    console.error(`Error generating page for quest ${id}: `, error);
  }
};

export const writeQuestPage = async (
  cache: Promise<CacheProvider>,
  dbRow: DBRow
) => {
  const quest = await dbRowToQuest(cache, dbRow);
  const builder = questPageBuilder(quest);
  await writePageToFile(builder, "quest", quest.name, dbRow.id.toString());
  return builder;
};
