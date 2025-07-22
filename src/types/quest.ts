export type QuestDifficulty =
  | "Novice"
  | "Intermediate"
  | "Experienced"
  | "Master"
  | "Grandmaster"
  | "Special";

export type QuestLength =
  | "Very Short"
  | "Short"
  | "Medium"
  | "Long"
  | "Very Long";

export type QuestType = "Quests" | "Miniquests";

export interface Quest {
  id: number;
  sortname: string;
  displayname: string;
  inPrerelease: boolean;
  type: QuestType;
  members: boolean;
  difficulty: QuestDifficulty;
  length: QuestLength;
  location: string;
  releasedate: string;
  series: string;
  seriesno: number;
  seriesnoOverride: number;
  startcoord: string;
  startnpc: number;
  startloc: string;
  mapelement: string;
  questpoints: number;
  unstartedstate: number;
  endstate: number;
  version: number;
  parentQuest: number;
  hasSubquests: boolean;
  requirementStats: string;
  recommendedStats: string;
  requirementQuests: string;
  requirementQuestpoints: number;
  requirementCombat: number;
  recommendedCombat: number;
  requirementCheckSkillsOnStart: boolean;
  requirementsBoostable: boolean;
  speedrun: boolean;
  totalXpAwarded: number;
  prerequisiteDirect: string;
  prerequisiteIndirect: string;
  crCanRecommend: boolean;
  crExperienceProfile: string;
  crRecommendationReason: string;
  crRecommendationReasonIsPrimary: boolean;
  crPointsSkill: number;
  crPointsTransport: number;
  crPointsEquipment: number;
  crPointsArea: number;
  crPointsXpType: string;
  crStarter: boolean;
  fswWorldFirstId: number;
}
