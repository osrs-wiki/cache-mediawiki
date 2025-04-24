import { mkdir, writeFile } from "fs/promises";

import {
  CombatAchievement,
  CombatAchievementTier,
  CombatAchievementType,
  combatAchievementPageBuilder,
} from "../../mediawiki/pages/combatAchievement";
import { ParamID, Struct } from "../../utils/cache2";
import { formatFileName } from "../../utils/files";

/**
 * Enums
 */
export const TIER_ENUM_ID = 3967;
export const TYPE_ENUM_ID = 3968;
export const TIER_MAP_ENUM_ID = 3980;
export const MONSTER_MAP_ENUM_ID = 3971;
export const CA_TASKS = [3981, 3982, 3983, 3984, 3985, 3986];

/**
 * Params
 */
export const CAID_PARAM_ID = 1306;
export const TITLE_PARAM_ID = 1308;
export const DESCRIPTION_PARAM_ID = 1309;
export const TIER_PARAM_ID = 1310;
export const TYPE_PARAM_ID = 1311;
export const MONSTER_PARAM_ID = 1312;

/**
 * Generate a CombatAchievement type from the cache.
 * @param struct The struct of the CA task
 * @param tierMap A map of tier keys to tier strings
 * @param typeMap A map of type keys to type strings
 * @param monsterMap A map of monster keys to monster strings
 * @returns A {CombatAchievement}
 */
export const getCombatAchievement = (
  struct: Struct,
  tierMap: Map<number, string | number>,
  typeMap: Map<number, string | number>,
  monsterMap: Map<number, string | number>
): CombatAchievement => {
  const id = struct.params.get(CAID_PARAM_ID as ParamID) as number;
  const title = struct.params.get(TITLE_PARAM_ID as ParamID) as string;
  const description = struct.params.get(
    DESCRIPTION_PARAM_ID as ParamID
  ) as string;
  const monsterKey = struct.params.get(MONSTER_PARAM_ID as ParamID) as number;
  const tierKey = struct.params.get(TIER_PARAM_ID as ParamID) as number;
  const typeKey = struct.params.get(TYPE_PARAM_ID as ParamID) as number;

  const monster = monsterMap.get(monsterKey) as string;
  const monsterFormatted = monster ? formatMonsterName(monster) : "";
  const tier = tierMap.get(tierKey) as CombatAchievementTier;
  const type = typeMap.get(typeKey) as CombatAchievementType;

  return {
    id,
    title,
    description,
    monster: monsterFormatted,
    tier,
    type,
  };
};

/**
 * Format a monster name from the enum.
 * @param monster The monster name from the enum
 * @returns
 */
export const formatMonsterName = (monster: string) => {
  const split = monster.split(", ");
  return split.reverse().join(" ");
};

/**
 * Write a CombatAchievement to a file.
 *  The file name is the title of the achievement.
 * @param combatAchievement The CombatAchievement object
 */
export const writeCombatAchievement = async (
  combatAchievement: CombatAchievement
) => {
  const builder = combatAchievementPageBuilder(combatAchievement);

  const dir = formatFileName(
    `./out/combatAchievements/${combatAchievement.monster}`
  );
  const fileName = formatFileName(`${dir}/${combatAchievement.title}.txt`);
  try {
    await mkdir(dir, { recursive: true });
    writeFile(fileName, builder.build());
  } catch (e) {
    console.error(`Error creating CA file: ${fileName}`, e);
  }
};
