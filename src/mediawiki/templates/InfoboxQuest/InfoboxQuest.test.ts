import InfoboxQuestTemplate from "./InfoboxQuest";

import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";
import { NPC } from "@/utils/cache2";

describe("InfoboxQuest", () => {
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

  it("should render a complete quest infobox", () => {
    const infobox = InfoboxQuestTemplate(baseQuest);
    expect(infobox).toMatchSnapshot();
  });

  it("should render infobox for F2P quest", () => {
    const f2pQuest = { ...baseQuest, members: false };
    const infobox = InfoboxQuestTemplate(f2pQuest);
    expect(infobox).toMatchSnapshot();
  });

  it("should render infobox without series", () => {
    const questWithoutSeries = { ...baseQuest, series: "", seriesno: 0 };
    const infobox = InfoboxQuestTemplate(questWithoutSeries);
    expect(infobox).toMatchSnapshot();
  });

  it("should render miniquest infobox", () => {
    const miniquest = {
      ...baseQuest,
      type: "Miniquests" as QuestType,
      questpoints: 0,
    };
    const infobox = InfoboxQuestTemplate(miniquest);
    expect(infobox).toMatchSnapshot();
  });
});
