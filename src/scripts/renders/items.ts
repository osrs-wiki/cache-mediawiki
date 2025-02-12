import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "../../context";
import { Item } from "../../utils/cache2";
import { formatFileName } from "../../utils/files";

export const renderItems = async (item: Item) => {
  if (item.name.toLocaleLowerCase() === "null") {
    return;
  }
  try {
    if (
      Context.renders &&
      existsSync("./data/renders/item/" + item.id + ".png")
    ) {
      await mkdir("./out/renders/item", { recursive: true });
      await mkdir("./out/renders/miniitems", { recursive: true });
      copyFile(
        "./data/renders/item/" + item.id + ".png",
        formatFileName("./out/renders/item/" + item.name + " detail.png")
      );
      copyFile(
        "./data/renders/miniitems/" + item.id + ".png",
        formatFileName("./out/renders/miniitems/" + item.name + ".png")
      );
    }
  } catch (e) {
    console.error(e);
  }
};
