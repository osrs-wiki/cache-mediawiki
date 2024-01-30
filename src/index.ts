import config from "@config";
import { parseArgs } from "node:util";

import generateCluePages from "./scripts/clues";
import differences from "./scripts/difference/difference";
import infoboxGenerator from "./scripts/infoboxGenernator";

console.log(`Running ${config.environment}`);

const {
  values: { task, infobox },
} = parseArgs({
  options: {
    task: {
      type: "string",
      short: "t",
    },
    infobox: {
      type: "string",
    },
  },
});

if (task === "differences") {
  differences();
} else if (task === "infobox" && infobox) {
  infoboxGenerator(infobox);
} else if (task === "clues") {
  generateCluePages();
} else {
  console.log("Invalid type argument...");
}
