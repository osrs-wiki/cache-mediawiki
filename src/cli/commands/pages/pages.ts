import { Command, Option } from "commander";

import pageGenerator from "@/tasks/pages/pages";

const pages = new Command("pages")
  .alias("page")
  .description("Generate a page for an area, item, npc, or scenery.")
  .action((options) => {
    pageGenerator(options.type, options.id);
  })
  .addOption(
    new Option(
      "-t, --type <type>",
      "The type of page to generate (area, item, npc, scenery)"
    )
      .choices(["area", "item", "music", "npc", "scenery"])
      .default("item")
  )
  .requiredOption(
    "-i, --id <id>",
    "The ID of the area, item, NPC, or scenery.",
    parseInt
  );

export default pages;
