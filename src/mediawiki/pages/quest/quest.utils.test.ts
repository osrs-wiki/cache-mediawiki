import {
  cacheXpToWikiXp,
  formatQuestRecommendations,
  formatQuestRequirements,
  formatQuestRewards,
  formatSeries,
} from "./quest.utils";

import { Quest } from "@/types/quest";

const quest = {
  series: 17,
  seriesName: "Kourend",
  seriesNumber: 5,
  seriesNumberOverride: "3C",
  requiredStats: [{ skill: 18, level: 58, skillName: "Slayer" }],
  recommendedStats: [{ skill: 16, level: 70, skillName: "Agility" }],
  questRequirements: [
    {
      rowId: 115,
      name: "Rag and Bone Man II",
      prerequisites: [
        {
          rowId: 114,
          name: "Rag and Bone Man I",
          prerequisites: [],
        },
      ],
    },
  ],
  requiredQuestPoints: 32,
  requiredCombatLevel: 85,
  recommendedCombatLevel: 90,
  requirementsBoostable: true,
  requirementCheckSkillsOnStart: true,
  awardedStats: [{ skill: 13, level: 3000, skillName: "Smithing" }],
} as Quest;

describe("quest page formatting", () => {
  it("converts cache XP tenths to wiki experience values", () => {
    expect(cacheXpToWikiXp(14062)).toBe(1406);
    expect(cacheXpToWikiXp(30000)).toBe(3000);
  });

  it("formats series number overrides", () => {
    expect(formatSeries(quest)).toBe("[[Quests/Series#Kourend|Kourend]], #3C");
  });

  it("formats nested requirements", () => {
    expect(formatQuestRequirements(quest)).toBe(
      [
        "* {{SCP|Slayer|58|link=yes}} {{Boostable|yes}} {{Questreqstart|yes}}",
        "*{{SCP|Combat|85|link=yes}}",
        "*{{SCP|Quest|32|link=yes}} [[Quest points]]",
        "*Completion of the following quests:",
        "**[[Rag and Bone Man II]]",
        "***[[Rag and Bone Man I]]",
      ].join("\n")
    );
  });

  it("formats recommendations", () => {
    expect(formatQuestRecommendations(quest)).toBe(
      "*{{SCP|Agility|70|link=yes}}\n*{{SCP|Combat|90|link=yes}}"
    );
  });

  it("formats awarded experience with skill links", () => {
    expect(formatQuestRewards(quest)).toBe(
      "*{{SCP|Smithing|3,000}} [[Smithing]] [[experience]]"
    );
  });

  it("formats multiple awarded experience entries", () => {
    expect(
      formatQuestRewards({
        ...quest,
        awardedStats: [
          { skill: 12, level: 1406, skillName: "Crafting" },
          { skill: 5, level: 5000, skillName: "Prayer" },
        ],
      })
    ).toBe(
      [
        "*{{SCP|Crafting|1,406}} [[Crafting]] [[experience]]",
        "*{{SCP|Prayer|5,000}} [[Prayer]] [[experience]]",
      ].join("\n")
    );
  });
});
