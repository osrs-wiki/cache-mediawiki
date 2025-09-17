import { Command, Option } from "commander";

import differencesCache from "@/tasks/differences/differences";

const differences = new Command("differences")
  .alias("diffs")
  .description(
    "Generate a page outlining differences between two cache versions."
  )
  .addOption(
    new Option(
      "--indices <indices>",
      "Comma-separated list of index IDs to include in differences (e.g., '2,5,8'). If not provided, all indices are checked."
    )
  )
  .action((options) => {
    differencesCache({
      oldVersion: options.oldCache,
      newVersion: options.newCache,
      method: options.cacheSource,
      type: options.cacheType,
      indices: options.indices,
    });
  });

export default differences;
