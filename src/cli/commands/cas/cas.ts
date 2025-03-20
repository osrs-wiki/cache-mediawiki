import { Command } from "commander";

import generateCombatAchievements from "../../../tasks/combatAchievements";

const cas = new Command("cas")
  .description("Generate combat achievement pages.")
  .action((options) => {
    generateCombatAchievements(
      options.cacheSource,
      options.newCache,
      options.cacheType
    );
  });

export default cas;
