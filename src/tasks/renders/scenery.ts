import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "@/context";
import { Obj } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";

export const renderScenery = async (scenery: Obj) => {
  if (scenery.name.toLocaleLowerCase() === "null") {
    return;
  }
  try {
    if (
      Context.renders &&
      existsSync(`./data/${Context.renders}/object/${scenery.id}_orient0.png`)
    ) {
      await mkdir(`./out/${Context.renders}/scenery`, { recursive: true });
      await copyFile(
        `./data/${Context.renders}/object/${scenery.id}_orient0.png`,
        formatFileName(`./out/${Context.renders}/scenery/${scenery.name}.png`)
      );
    }
  } catch (e) {
    console.error(e);
  }
};
