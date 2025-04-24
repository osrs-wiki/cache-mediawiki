import { Command } from "commander";

import generateCombatAchievements from "../../../tasks/combatAchievements";

const combatAchievements = new Command("combatAchievements")
  .alias("cas")
  .description("Generate combat achievement pages.")
  .action((options) => {
    generateCombatAchievements(
      options.cacheSource,
      options.newCache,
      options.cacheType
    );
  });

export default combatAchievements;
