import QuestRewards from "./QuestRewards";

import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";
import { NPC } from "@/utils/cache2";

describe("QuestRewards", () => {
  const mockNPC = { id: 123, name: "Test NPC" } as NPC;

  const baseQuest: Quest = {
    id: 170,
    sortname: "The Curse of Arrav",
    displayname: "The Curse of Arrav",
    inPrerelease: false,
    type: "Quests" as QuestType,
    members: true,
    difficulty: "Master" as QuestDifficulty,
    length: "Medium" as QuestLength,
    location: "Uzer Oasis",
    releasedate: "2024-11-06",
    series: "Mahjarrat",
    seriesno: 10,
    seriesnoOverride: 0,
    startcoord: "3505,3038",
    startnpc: mockNPC,
    startloc: "Uzer Oasis",
    mapelement: "",
    questpoints: 2,
    unstartedstate: 0,
    endstate: 1,
    version: 1,
    parentQuest: 0,
    hasSubquests: false,
    requirementStats: "",
    recommendedStats: "",
    requirementQuests: "",
    requirementQuestpoints: 0,
    requirementCombat: 0,
    recommendedCombat: 85,
    requirementCheckSkillsOnStart: false,
    requirementsBoostable: false,
    speedrun: false,
    totalXpAwarded: 120000,
    prerequisiteDirect: "",
    prerequisiteIndirect: "",
    crCanRecommend: false,
    crExperienceProfile: "",
    crRecommendationReason: "",
    crRecommendationReasonIsPrimary: false,
    crPointsSkill: 0,
    crPointsTransport: 0,
    crPointsEquipment: 0,
    crPointsArea: 0,
    crPointsXpType: "",
    crStarter: false,
    fswWorldFirstId: 0,
  };

  it("should render quest rewards", () => {
    const rewards = QuestRewards(baseQuest);
    expect(rewards).toMatchSnapshot();
  });

  it("should render quest rewards without XP", () => {
    const questWithoutXp = { ...baseQuest, totalXpAwarded: 0 };
    const rewards = QuestRewards(questWithoutXp);
    expect(rewards).toMatchSnapshot();
  });

  it("should render miniquest rewards", () => {
    const miniquest = {
      ...baseQuest,
      questpoints: 0,
      type: "Miniquests" as QuestType,
    };
    const rewards = QuestRewards(miniquest);
    expect(rewards).toMatchSnapshot();
  });
});
