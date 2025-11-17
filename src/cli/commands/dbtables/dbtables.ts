import { Command } from "commander";

import exportDBTablesToCSV from "@/tasks/dbtables";

const dbtables = new Command("dbtables")
  .alias("db")
  .description("Export all DBTables and their DBRows to CSV files.")
  .action((options) => {
    exportDBTablesToCSV(
      options.cacheSource,
      options.newCache,
      options.cacheType
    );
  });

export default dbtables;
