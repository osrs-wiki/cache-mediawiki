import { program } from "commander";

import { combatAchievements, clues, differences, pages } from "./commands";
import options from "./options";
import packageJson from "../../package.json";

import Context from "@/context";
import { getExamines } from "@/utils/examines";
import { getLatestNewsTitle } from "@/utils/news";

const commands = [combatAchievements, clues, differences, pages];

program
  .name("Cache to MediaWiki tools")
  .description(
    "A set of scripts for fetching content from the OSRS cache and transforming it into MediaWiki format."
  )
  .version(packageJson.version)
  .hook("preAction", async (_program, command) => {
    const options = command.optsWithGlobals();
    Context.beta = options.beta;
    Context.pages = options.pages;
    Context.update = options.update;
    Context.updateDate = options.updateDate;

    const renders = options.renders;
    Context.renders =
      renders === "true"
        ? "renders"
        : renders === "false"
        ? undefined
        : renders;

    if (Context.update === "auto") {
      const latestUpdate = await getLatestNewsTitle();
      if (latestUpdate) {
        Context.update = latestUpdate.title;
        Context.updateDate = latestUpdate.date;
      }
    }

    if (options.examines) {
      const version = options.examinesVersion;
      Context.examines = {
        npcs: {},
        scenery: {},
      };

      const npcExamines = await getExamines("npcs", version);
      Object.keys(npcExamines).forEach((key) => {
        Context.examines.npcs[key] = npcExamines[key];
      });

      const objectExamines = await getExamines("locs", version);
      Object.keys(objectExamines).forEach((key) => {
        Context.examines.scenery[key] = objectExamines[key];
      });
    }
  });

commands.forEach((command) => {
  options.forEach((option) => {
    command.addOption(option);
  });
  program.addCommand(command);
});

export default program;
