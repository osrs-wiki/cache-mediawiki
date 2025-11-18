import { Command, Option } from "commander";

import replaceVariants from "@/tasks/variants";

const variants = new Command("variants")
  .alias("var")
  .description(
    "Replace numbered variants with custom names in multiChildren files"
  )
  .addOption(
    new Option(
      "--sourceDir <path>",
      "Directory containing files to process"
    ).default("out/pages/item/named/multiChildren")
  )
  .addOption(
    new Option(
      "--pattern <pattern>",
      "File name pattern to match (glob syntax)"
    ).default("*.txt")
  )
  .addOption(
    new Option(
      "--itemFilter <regex>",
      "Optional regex to filter item names (e.g., '^Crate of')"
    )
  )
  .addOption(
    new Option(
      "--sourceParam <param>",
      "Parameter name containing source values (e.g., 'examine', 'description')"
    ).default("examine")
  )
  .addOption(
    new Option(
      "--extractionPattern <regex>",
      "Regex pattern to extract custom names (use capturing group)"
    ).default("destined for (.+?)\\.$")
  )
  .addOption(
    new Option(
      "--targetParams <params>",
      "Comma-separated list of parameters to update (e.g., 'version,image')"
    ).default("version,image,altimage")
  )
  .addOption(
    new Option(
      "--imageDirectories <dirs>",
      "Comma-separated list of image directories to process"
    )
  )
  .addOption(
    new Option("--skipFirstVersionSuffix", "Skip suffix for first version")
  )
  .addOption(new Option("--dryRun", "Preview changes without modifying files"))
  .action(async (options) => {
    await replaceVariants({
      sourceDir: options.sourceDir,
      pattern: options.pattern,
      itemFilter: options.itemFilter
        ? new RegExp(options.itemFilter)
        : undefined,
      sourceParam: options.sourceParam,
      extractionPattern: new RegExp(options.extractionPattern),
      targetParams: options.targetParams
        .split(",")
        .map((p: string) => p.trim()),
      imageDirectories: options.imageDirectories
        ? options.imageDirectories.split(",").map((d: string) => d.trim())
        : undefined,
      skipFirstVersionSuffix: options.skipFirstVersionSuffix || false,
      dryRun: options.dryRun || false,
    });
  });

export default variants;
