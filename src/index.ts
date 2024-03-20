import config from "@config";
import { parseArgs } from "node:util";

import Context from "./context";
import generateCluePages from "./scripts/clues";
import differencesCache from "./scripts/differences/differences";
import { CacheSource } from "./utils/cache";

console.log(`Running ${config.environment}`);

const {
  values: {
    cacheSource,
    oldCache,
    newCache,
    task,
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

if (task === "differences" || (task === "diffs" && oldCache)) {
  differencesCache({
    oldVersion: oldCache,
    newVersion: newCache,
    method: cacheSource as CacheSource,
    //type: cacheFileType as CacheFileType,
    type: "flat",
  });
}
if (task === "clues") {
  generateCluePages(cacheSource as CacheSource, newCache, "flat");
} else {
  console.log("Invalid type argument...");
}
