import { Option } from "commander";

const options = [
  new Option(
    "-n, --newCache <newCache>",
    "Path to the new cache."
  ).makeOptionMandatory(),
  new Option("-o, --oldCache <oldCache>", "Path to the old cache."),
  new Option("--cacheSource <source>", "Source of the cache.")
    .choices(["github", "local"])
    .default("github"),
  new Option("--cacheType <type>", "Type of the cache.")
    .choices(["disk", "flat"])
    .default("flat"),
  new Option("--renders <renders>", "Include renders in the output.").default(
    false
  ),
  new Option(
    "--infoboxes <infoboxes>",
    "Include pages with infoboxes in the output."
  ).default(false),
  new Option("--update <update>", "The news post update title."),
  new Option("--updateDate <updateDate>", "The news post update date."),
  new Option(
    "--examines <examines>",
    "Include examines in the output."
  ).default(false),
  new Option(
    "--examinesVersion <examinesVersion>",
    "The version of the examines."
  ).default("latest"),
];

export default options;
