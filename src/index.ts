import config from "@config";
import { parseArgs } from "node:util";

import generateCluePages from "./scripts/clues";
import differencesCache from "./scripts/differences/differences";
import infoboxGenerator from "./scripts/infoboxGenernator";
import { CacheSource } from "./utils/cache";

console.log(`Running ${config.environment}`);

const {
  values: { cacheSource, oldCache, newCache, task, infobox },
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
    infobox: {
      type: "string",
    },
  },
});

if (task === "differences" || (task === "diffs" && oldCache)) {
  differencesCache({
    oldVersion: oldCache,
    newVersion: newCache,
    method: cacheSource as CacheSource,
    //type: cacheFileType as CacheFileType,
    type: "flat",
  });
} else if (task === "infobox" && infobox) {
  infoboxGenerator(infobox);
} else if (task === "clues") {
  generateCluePages();
} else {
  console.log("Invalid type argument...");
}
