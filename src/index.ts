import config from "@config";
import { parseArgs } from "node:util";

import generateCluePages from "./scripts/clues";
import differencesCache from "./scripts/differences/differences";
import infoboxGenerator from "./scripts/infoboxGenernator";

console.log(`Running ${config.environment}`);

const {
  values: { oldCache, newCache, task, infobox },
} = parseArgs({
  options: {
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

if (task === "differences" && oldCache) {
  differencesCache(oldCache, newCache);
} else if (task === "infobox" && infobox) {
  infoboxGenerator(infobox);
} else if (task === "clues") {
  generateCluePages();
} else {
  console.log("Invalid type argument...");
}
