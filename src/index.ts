import config from "@config";
import { parseArgs } from "node:util";

import generateCluePages from "./scripts/clues";
import differencesCache from "./scripts/differences/differences";
import infoboxGenerator from "./scripts/infoboxGenernator";
import { CacheMethod } from "./utils/cache";

console.log(`Running ${config.environment}`);

const {
  values: { cacheMethod, oldCache, newCache, task, infobox },
} = parseArgs({
  options: {
    oldCache: {
      type: "string",
    },
    newCache: {
      type: "string",
    },
    cacheMethod: {
      type: "string",
      default: "github",
    },
    task: {
      type: "string",
      short: "t",
    },
    infobox: {
      type: "string",
    },
  },
});

if (task === "differences" || (task === "diffs" && oldCache)) {
  differencesCache({
    oldVersion: oldCache,
    newVersion: newCache,
    method: cacheMethod as CacheMethod,
  });
} else if (task === "infobox" && infobox) {
  infoboxGenerator(infobox);
} else if (task === "clues") {
  generateCluePages();
} else {
  console.log("Invalid type argument...");
}
