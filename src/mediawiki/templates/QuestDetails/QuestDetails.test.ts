import QuestDetails from "./QuestDetails";

import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";

describe("QuestDetails", () => {
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
    startnpc: 123,
    startloc: "Uzer Oasis",
    mapelement: "",
    questpoints: 2,
    unstartedstate: 0,
    endstate: 1,
    version: 1,
    parentQuest: 0,
    hasSubquests: false,
    requirementStats: "* {{SCP|Mining|64|link=yes}}{{Boostable|no}}",
    recommendedStats: "* {{SCP|Combat|85|link=yes}}",
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

  it("should render complete quest details", () => {
    const details = QuestDetails(baseQuest);
    expect(details).toMatchSnapshot();
  });

  it("should render quest details without requirements", () => {
    const questWithoutReqs = {
      ...baseQuest,
      requirementStats: "",
      recommendedStats: "",
    };
    const details = QuestDetails(questWithoutReqs);
    expect(details).toMatchSnapshot();
  });

  it("should render quest details without coordinates", () => {
    const questWithoutCoords = { ...baseQuest, startcoord: "" };
    const details = QuestDetails(questWithoutCoords);
    expect(details).toMatchSnapshot();
  });
});
