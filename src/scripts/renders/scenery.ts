import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "../../context";
import { Obj } from "../../utils/cache2";
import { formatFileName } from "../../utils/files";

export const renderScenery = async (obj: Obj) => {
  if (obj.name.toLocaleLowerCase() === "null") {
    return;
  }
  try {
    if (
      Context.renders &&
      existsSync("./data/renders/object/" + obj.id + ".png")
    ) {
      await mkdir("./out/renders/scenery", { recursive: true });
      await copyFile(
        "./data/renders/object/" + obj.id + ".png",
        formatFileName("./out/renders/scenery/" + obj.name + ".png")
      );
    }
  } catch (e) {
    console.error(e);
  }
};
