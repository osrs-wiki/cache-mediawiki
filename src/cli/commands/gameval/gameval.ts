import { Command, Option } from "commander";

import { buildGameValMappings, getGameValChanges } from "@/tasks/gameval";
import { GameValID } from "@/utils/cache2";

const parseGameValTypes = (typesString?: string): GameValID[] | undefined => {
  if (!typesString) return undefined;
  return typesString
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => !isNaN(n)) as GameValID[];
};

const gameval = new Command("gameval")
  .alias("gamevals")
  .description(
    "Build GameVal mappings and detect ID changes between two cache versions."
  )
  .addOption(
    new Option(
      "--includeTypes <types>",
      "Comma-separated list of GameVal type IDs to include (e.g., '0,1,2'). If not provided, includes all except excluded types."
    )
  )
  .addOption(
    new Option(
      "--excludeTypes <types>",
      "Comma-separated list of GameVal type IDs to exclude (e.g., '10,13,14'). Defaults to advanced types (DBTable, legacy widget, widget)."
    )
  )
  .addOption(
    new Option(
      "--changesOnly",
      "Only output GameVal ID changes without complete mappings for faster processing."
    ).default(false)
  )
  .action(async (options) => {
    const includeTypes = parseGameValTypes(options.includeTypes);
    const excludeTypes = parseGameValTypes(options.excludeTypes);

    if (options.changesOnly) {
      await getGameValChanges({
        oldCache: options.oldCache,
        newCache: options.newCache,
        cacheSource: options.cacheSource,
        cacheType: options.cacheType,
        includeTypes,
        excludeTypes,
      });
    } else {
      await buildGameValMappings({
        oldCache: options.oldCache,
        newCache: options.newCache,
        cacheSource: options.cacheSource,
        cacheType: options.cacheType,
        includeTypes,
        excludeTypes,
      });
    }
  });

export default gameval;
