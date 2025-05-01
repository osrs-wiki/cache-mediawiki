import { Command } from "commander";

import generateCluePages from "@/tasks/clues";

const clues = new Command("clues")
  .description("Generate clue scroll pages.")
  .action((options) => {
    generateCluePages(options.cacheSource, options.newCache, options.cacheType);
  });

export default clues;
