export type QuestStatRequirement = {
  skill: number;
  level: number;
  skillName: string;
};

export type QuestPrerequisite = {
  rowId: number;
  name: string;
  prerequisites: QuestPrerequisite[];
};

export type Quest = {
  rowId: number;
  id: number;
  sortName: string;
  name: string;
  releaseType: number;
  type: number;
  members: boolean;
  difficulty: number;
  difficultyName: string;
  length: number;
  lengthName: string;
  releaseDate?: Date;
  series?: number;
  seriesName?: string;
  seriesNumber?: number;
  seriesNumberOverride?: string;
  startCoordinate?: {
    x: number;
    y: number;
    plane: number;
  };
  startNpcName?: string;
  startObjectName?: string;
  startAreaName?: string;
  questPoints: number;
  requiredStats: QuestStatRequirement[];
  recommendedStats: QuestStatRequirement[];
  questRequirements: QuestPrerequisite[];
  requiredQuestPoints: number;
  requiredCombatLevel: number;
  recommendedCombatLevel: number;
  requirementsBoostable: boolean;
  requirementCheckSkillsOnStart: boolean;
  description?: string;
  awardedStats: QuestStatRequirement[];
};
