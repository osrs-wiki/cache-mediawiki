import { writePageToFile } from "../pages.utils";

import { questPageBuilder } from "@/mediawiki/pages/quest";
import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";
import { CacheProvider, DBTable, DBTableID } from "@/utils/cache2";

export const writeQuestPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    // Load quest data from DBTable 0
    const questRows = await DBTable.loadRows(cache, 0 as DBTableID);
    const questRow = questRows.find((row) => row && row.values[0][0] === id);

    if (questRow) {
      const quest = questRowToQuest(questRow);
      if (quest) {
        writeQuestPage(quest);
      }
    }
  } catch (e) {
    console.error(`Error generating page for quest ${id}: `, e);
  }
};

export const writeQuestPage = async (quest: Quest) => {
  const builder = questPageBuilder(quest);
  writePageToFile(builder, "quest", quest.displayname, quest.id.toString());
};

/**
 * Converts a DBRow from the quest table to a Quest object
 */
export function questRowToQuest(row: {
  values: (string | number | bigint | undefined)[][];
}): Quest | null {
  try {
    const values = row.values;

    // Extract values from the row
    const getValue = (index: number) => values[index] && values[index][0];
    const getBooleanValue = (index: number) => Boolean(getValue(index));

    return {
      id: getValue(0) as number,
      sortname: (getValue(1) as string) || "",
      displayname: (getValue(2) as string) || "",
      inPrerelease: getBooleanValue(3),
      type:
        getValue(4) === 0
          ? ("Quests" as QuestType)
          : ("Miniquests" as QuestType),
      members: getBooleanValue(5),
      difficulty: (getValue(6) as QuestDifficulty) || "Novice",
      length: (getValue(7) as QuestLength) || "Short",
      location: (getValue(8) as string) || "",
      releasedate: (getValue(9) as string) || "",
      series: (getValue(10) as string) || "",
      seriesno: (getValue(11) as number) || 0,
      seriesnoOverride: (getValue(12) as number) || 0,
      startcoord: (getValue(13) as string) || "",
      startnpc: (getValue(14) as number) || 0,
      startloc: (getValue(15) as string) || "",
      mapelement: (getValue(16) as string) || "",
      questpoints: (getValue(17) as number) || 0,
      unstartedstate: (getValue(18) as number) || 0,
      endstate: (getValue(19) as number) || 0,
      version: (getValue(20) as number) || 0,
      parentQuest: (getValue(21) as number) || 0,
      hasSubquests: getBooleanValue(22),
      requirementStats: (getValue(23) as string) || "",
      recommendedStats: (getValue(24) as string) || "",
      requirementQuests: (getValue(25) as string) || "",
      requirementQuestpoints: (getValue(26) as number) || 0,
      requirementCombat: (getValue(27) as number) || 0,
      recommendedCombat: (getValue(28) as number) || 0,
      requirementCheckSkillsOnStart: getBooleanValue(29),
      requirementsBoostable: getBooleanValue(30),
      speedrun: getBooleanValue(31),
      totalXpAwarded: (getValue(32) as number) || 0,
      prerequisiteDirect: (getValue(33) as string) || "",
      prerequisiteIndirect: (getValue(34) as string) || "",
      crCanRecommend: getBooleanValue(35),
      crExperienceProfile: (getValue(36) as string) || "",
      crRecommendationReason: (getValue(37) as string) || "",
      crRecommendationReasonIsPrimary: getBooleanValue(38),
      crPointsSkill: (getValue(39) as number) || 0,
      crPointsTransport: (getValue(40) as number) || 0,
      crPointsEquipment: (getValue(41) as number) || 0,
      crPointsArea: (getValue(42) as number) || 0,
      crPointsXpType: (getValue(43) as string) || "",
      crStarter: getBooleanValue(44),
      fswWorldFirstId: (getValue(45) as number) || 0,
    };
  } catch (error) {
    console.error("Error converting quest row to Quest object:", error);
    return null;
  }
}
