import { Command, Option } from "commander";

import pageGenerator from "@/tasks/pages/pages";

const pages = new Command("pages")
  .alias("page")
  .description("Generate a page for an area, item, music track, npc, quest, or scenery.")
  .action((options) => {
    pageGenerator(options.type, options.id, {
      cacheVersion: options.newCache,
      cacheSource: options.cacheSource,
      cacheType: options.cacheType,
    });
  })
  .addOption(
    new Option(
      "-t, --type <type>",
      "The type of page to generate (area, item, music, npc, quest, scenery)"
    )
      .choices(["area", "item", "music", "npc", "quest", "scenery"])
      .default("item")
  )
  .requiredOption(
    "-i, --id <id>",
    "The ID of the area, item, music track, NPC, quest DBRow, or scenery.",
    parseInt
  );

export default pages;
