import { program } from "commander";

import { combatAchievements, clues, differences } from "./commands";
import options from "./options";
import packageJson from "../../package.json";
import Context from "../context";
import { getExamines } from "../utils/examines";
import { getLatestNewsTitle } from "../utils/news";

const commands = [combatAchievements, clues, differences];

program
  .name("Cache to MediaWiki tools")
  .description(
    "A set of scripts for fetching content from the OSRS cache and transforming it into MediaWiki format."
  )
  .version(packageJson.version)
  .hook("preAction", async (command) => {
    Context.pages = command.opts().pages;
    Context.update = command.opts().update;
    Context.updateDate = command.opts().updateDate;

    const renders = command.opts().renders;
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

    if (command.opts().examines) {
      const version = command.opts().examinesVersion;
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
