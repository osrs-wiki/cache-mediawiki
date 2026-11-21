import questPageBuilder from "./quest";

import Context from "@/context";
import { Quest } from "@/types/quest";

beforeEach(() => {
  Context.newContentTemplate = "New Content";
  Context.update = "Quest Month Week 3 & TFA Practice Mode";
});

const quest: Quest = {
  rowId: 13730,
  id: 223,
  sortName: "Rag and Bone Man III",
  name: "Rag and Bone Man III",
  releaseType: 2,
  type: 0,
  members: true,
  difficulty: 2,
  difficultyName: "Experienced",
  length: 2,
  lengthName: "Medium",
  releaseDate: new Date(2026, 10, 18),
  series: 13,
  seriesName: "Rag and Bone Man",
  seriesNumber: 3,
  startCoordinate: {
    x: 3360,
    y: 3506,
    plane: 0,
  },
  startNpcName: "Odd Old Man",
  startAreaName: "Silvarea",
  questPoints: 3,
  requiredStats: [{ skill: 18, level: 58, skillName: "Slayer" }],
  recommendedStats: [],
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
  requiredQuestPoints: 0,
  requiredCombatLevel: 3,
  recommendedCombatLevel: 65,
  requirementsBoostable: false,
  requirementCheckSkillsOnStart: true,
  description: "Finish assisting the Odd Old Man with his collection.",
  awardedStats: [],
};

describe("questPageBuilder", () => {
  it("builds a quest stub from cache-derived data", () => {
    const output = questPageBuilder(quest)
      .build()
      .replace(/[ \t]+$/gm, "");

    expect(output).toContain(
      "|update = Quest Month Week 3 & TFA Practice Mode"
    );
    expect(output).toContain("{{Hastranscript|quest}}");
    expect(output).toMatchSnapshot();
  });

  it("uses the miniquest transcript type for miniquests", () => {
    const output = questPageBuilder({ ...quest, type: 1 }).build();

    expect(output).toContain("{{Hastranscript|miniquest}}");
  });

  it("includes stat XP awards in the rewards template", () => {
    const output = questPageBuilder({
      ...quest,
      awardedStats: [{ skill: 12, level: 1406, skillName: "Crafting" }],
    }).build();

    expect(output).toContain("|rewards = *{{SCP|Crafting|1,406}}");
    expect(output).toContain(
      "*{{SCP|Crafting|1,406}} [[Crafting]] [[experience]]"
    );
  });
});
