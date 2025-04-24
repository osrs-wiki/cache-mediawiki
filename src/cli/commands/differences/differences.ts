import { Command } from "commander";

import differencesCache from "../../../tasks/differences/differences";

const differences = new Command("differences")
  .alias("diffs")
  .description(
    "Generate a page outlining differences between two cache version."
  )
  .action((options) => {
    differencesCache({
      oldVersion: options.oldCache,
      newVersion: options.newCache,
      method: options.cacheSource,
      type: options.cacheType,
    });
  });

export default differences;
