import {
  CA_TASKS,
  MONSTER_MAP_ENUM_ID,
  TIER_ENUM_ID,
  TYPE_ENUM_ID,
  getCombatAchievement,
  getEnumMap,
  writeCombatAchievement,
} from "./utils";
import {
  CacheSource,
  CacheFileType,
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "../../utils/cache";
import { Enum, Struct } from "../../utils/cache2";
import { LazyPromise } from "../../utils/cache2/LazyPromise";

const generateCombatAchievements = async (
  method: CacheSource,
  version: string,
  type: CacheFileType
) => {
  const cache = new LazyPromise(() =>
    method === "github"
      ? getCacheProviderGithub(version)
      : getCacheProviderLocal(version, type)
  ).asPromise();

  const tierMap = await getEnumMap(cache, TIER_ENUM_ID);
  const typeMap = await getEnumMap(cache, TYPE_ENUM_ID);
  const monsterMap = await getEnumMap(cache, MONSTER_MAP_ENUM_ID);

  CA_TASKS.forEach(async (tierTasksEnum) => {
    const tasksEnum = await Enum.load(cache, tierTasksEnum);
    console.log(
      `Loading CA ${tierTasksEnum} tier: ${tasksEnum.map.size} tasks.`
    );
    tasksEnum.map.forEach(async (taskStructId) => {
      const taskStruct = await Struct.load(cache, parseInt(`${taskStructId}`));
      const combatAchievement = getCombatAchievement(
        taskStruct,
        tierMap,
        typeMap,
        monsterMap
      );
      writeCombatAchievement(combatAchievement);
    });
  });
};

export default generateCombatAchievements;
