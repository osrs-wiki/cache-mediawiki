import {
  formatStartMap,
  formatRequirements,
  formatRecommended,
  formatQuestStart,
  formatQuestDescription,
} from "./QuestDetails.utils";

import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";

describe("QuestDetails Utils", () => {
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

  describe("formatStartMap", () => {
    it("should format coordinates", () => {
      const result = formatStartMap("3505,3038");
      expect(result).toBe("3505,3038");
    });

    it("should return undefined for empty coordinates", () => {
      const result = formatStartMap("");
      expect(result).toBeUndefined();
    });
  });

  describe("formatQuestStart", () => {
    it("should format quest start with NPC name", () => {
      const result = formatQuestStart(baseQuest, "Elias White");
      expect(result).toBe("Speak to [[Elias White]] at the [[Uzer Oasis]].");
    });

    it("should format quest start without NPC name", () => {
      const result = formatQuestStart(baseQuest);
      expect(result).toBe("Speak to NPC 123 at the [[Uzer Oasis]].");
    });

    it("should return undefined if no start location", () => {
      const quest = { ...baseQuest, startloc: "" };
      const result = formatQuestStart(quest);
      expect(result).toBeUndefined();
    });
  });

  describe("formatQuestDescription", () => {
    it("should format quest description", () => {
      const result = formatQuestDescription(baseQuest);
      expect(result).toBe("A master quest in Uzer Oasis.");
    });
  });

  describe("formatRequirements", () => {
    it("should return wiki-formatted requirements as is", () => {
      const wikiReqs = "* {{SCP|Mining|64|link=yes}}";
      const result = formatRequirements(wikiReqs);
      expect(result).toBe(wikiReqs);
    });

    it("should return raw requirements", () => {
      const rawReqs = "Mining 64, Thieving 62";
      const result = formatRequirements(rawReqs);
      expect(result).toBe(rawReqs);
    });

    it("should return undefined for empty requirements", () => {
      const result = formatRequirements("");
      expect(result).toBeUndefined();
    });
  });

  describe("formatRecommended", () => {
    it("should return wiki-formatted recommendations as is", () => {
      const wikiRecs = "* {{SCP|Combat|85|link=yes}}";
      const result = formatRecommended(wikiRecs);
      expect(result).toBe(wikiRecs);
    });

    it("should return raw recommendations", () => {
      const rawRecs = "Combat 85";
      const result = formatRecommended(rawRecs);
      expect(result).toBe(rawRecs);
    });

    it("should return undefined for empty recommendations", () => {
      const result = formatRecommended("");
      expect(result).toBeUndefined();
    });
  });
});
