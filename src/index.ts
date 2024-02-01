import config from "@config";
import { parseArgs } from "node:util";

import generateCluePages from "./scripts/clues";
import differencesCache from "./scripts/differences/differencesCache";
import infoboxGenerator from "./scripts/infoboxGenernator";

console.log(`Running ${config.environment}`);

const {
  values: { oldCache, task, infobox },
} = parseArgs({
  options: {
    oldCache: {
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
  differencesCache(oldCache);
} else if (task === "infobox" && infobox) {
  infoboxGenerator(infobox);
} else if (task === "clues") {
  generateCluePages();
} else {
  console.log("Invalid type argument...");
}
