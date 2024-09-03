import config from "@config";
import { parseArgs } from "node:util";

import Context from "./context";
import generateCluePages from "./scripts/clues";
import generateCombatAchievements from "./scripts/combatAchievements";
import differencesCache from "./scripts/differences/differences";
import { CacheSource } from "./utils/cache";
import { getExamines } from "./utils/examines";

console.log(`Running ${config.environment}`);

const {
  values: {
    cacheSource,
    oldCache,
    newCache,
    task,
    examines,
    examinesVersion,
    infobox,
    update,
    updateDate,
  },
} = parseArgs({
  options: {
    //TODO: Fix disk file type option.
    /*cacheFileType: {
      type: "string",
      default: "flat",
    },*/
    cacheSource: {
      type: "string",
      default: "github",
    },
    oldCache: {
      type: "string",
    },
    newCache: {
      type: "string",
    },
    task: {
      type: "string",
      short: "t",
    },
    examines: {
      type: "string",
    },
    examinesVersion: {
      type: "string",
      default: "master",
    },
    infobox: {
      type: "string",
    },
    update: {
      type: "string",
    },
    updateDate: {
      type: "string",
    },
  },
});

Context.infoboxes = infobox === "true";
Context.update = update;
Context.updateDate = updateDate;

const runCacheTools = async () => {
  if (examines === "true") {
    Context.examines = {
      items: {},
      npcs: {},
    };

    const npcExamines = await getExamines("npcs", examinesVersion);
    Object.keys(npcExamines).forEach((key) => {
      Context.examines.npcs[key] = npcExamines[key];
    });
  }

  if ((task === "differences" || task === "diffs") && oldCache) {
    differencesCache({
      oldVersion: oldCache,
      newVersion: newCache,
      method: cacheSource as CacheSource,
      //type: cacheFileType as CacheFileType,
      type: "flat",
    });
  } else if (task === "clues") {
    generateCluePages(cacheSource as CacheSource, newCache, "flat");
  } else if (task === "combat-achievements") {
    generateCombatAchievements(cacheSource as CacheSource, newCache, "flat");
  } else {
    console.log("Invalid type argument...");
  }
};

runCacheTools();
