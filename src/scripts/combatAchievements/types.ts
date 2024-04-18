export type CombatAchievementTier =
  | "Easy"
  | "Medium"
  | "Hard"
  | "Elite"
  | "Master"
  | "Grandmaster";

export type CombatAchievementType =
  | "Stamina"
  | "Perfection"
  | "Kill Count"
  | "Mechanical"
  | "Restriction"
  | "Speed";

export type CombatAchievement = {
  description: string;
  id: number;
  monster: string;
  tier: CombatAchievementTier;
  type: CombatAchievementType;
  title: string;
};
