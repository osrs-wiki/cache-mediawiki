export type SkillName =
  | "Attack"
  | "Strength"
  | "Defence"
  | "Ranged"
  | "Prayer"
  | "Magic"
  | "Runecraft"
  | "Construction"
  | "Hitpoints"
  | "Agility"
  | "Herblore"
  | "Thieving"
  | "Crafting"
  | "Fletching"
  | "Slayer"
  | "Hunter"
  | "Mining"
  | "Smithing"
  | "Fishing"
  | "Cooking"
  | "Firemaking"
  | "Woodcutting"
  | "Farming";

export type NonSkillClickpic =
  | "overall"
  | "diary"
  | "combatachievement"
  | "combat"
  | "combatstyle"
  | "dd"
  | "favour"
  | "minigame"
  | "music"
  | "raid"
  | "quest"
  | "time"
  | "total";

export type SCPSkill = SkillName | NonSkillClickpic;

export interface SCPProps {
  skill: SCPSkill;
  level?: number | string;
  link?: boolean;
  experience?: number | string;
  name?: string;
  txt?: string;
}
