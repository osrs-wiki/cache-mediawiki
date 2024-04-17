import {
  CacheSource,
  CacheFileType,
  getCacheProviderGithub,
  getCacheProviderLocal,
} from "../../utils/cache";
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
};

export default generateCombatAchievements;
