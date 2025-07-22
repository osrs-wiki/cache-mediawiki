import {
  formatQuestSeries,
  formatReleaseDate,
  formatQuestImage,
} from "./InfoboxQuest.utils";

import { Quest, QuestDifficulty, QuestLength, QuestType } from "@/types/quest";

describe("InfoboxQuest Utils", () => {
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

  describe("formatQuestSeries", () => {
    it("should format quest series with series number", () => {
      const result = formatQuestSeries(baseQuest);
      expect(result).toBe("Mahjarrat, #10");
    });

    it("should format quest series with series number override", () => {
      const quest = { ...baseQuest, seriesno: 0, seriesnoOverride: 5 };
      const result = formatQuestSeries(quest);
      expect(result).toBe("Mahjarrat, #5");
    });

    it("should format quest series without number", () => {
      const quest = { ...baseQuest, seriesno: 0, seriesnoOverride: 0 };
      const result = formatQuestSeries(quest);
      expect(result).toBe("Mahjarrat");
    });

    it("should return undefined for empty series", () => {
      const quest = { ...baseQuest, series: "" };
      const result = formatQuestSeries(quest);
      expect(result).toBeUndefined();
    });
  });

  describe("formatReleaseDate", () => {
    it("should format ISO date string", () => {
      const result = formatReleaseDate("2024-11-06");
      // Use a regex to account for timezone differences
      expect(result).toMatch(/\[\[[56] November\]\] \[\[2024\]\]/);
    });

    it("should return pre-formatted wiki date as is", () => {
      const wikiDate = "[[6 November]] [[2024]]";
      const result = formatReleaseDate(wikiDate);
      expect(result).toBe(wikiDate);
    });

    it("should return original string for unparseable dates", () => {
      const result = formatReleaseDate("invalid date");
      expect(result).toBe("invalid date");
    });

    it("should return undefined for empty date", () => {
      const result = formatReleaseDate("");
      expect(result).toBeUndefined();
    });
  });

  describe("formatQuestImage", () => {
    it("should format quest image filename", () => {
      const result = formatQuestImage(baseQuest);
      expect(result).toBe("[[File:The Curse of Arrav.png|300px]]");
    });

    it("should return undefined for quest without display name", () => {
      const quest = { ...baseQuest, displayname: "" };
      const result = formatQuestImage(quest);
      expect(result).toBeUndefined();
    });
  });
});
