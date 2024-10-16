import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "../../context";
import { Item } from "../../utils/cache2";

export const renderItems = async (item: Item) => {
  if (item.name.toLocaleLowerCase() === "null") {
    return;
  }
  if (
    Context.renders &&
    existsSync("./data/renders/item/" + item.id + ".png")
  ) {
    await mkdir("./out/renders/item", { recursive: true });
    await mkdir("./out/renders/miniitems", { recursive: true });
    copyFile(
      "./data/renders/item/" + item.id + ".png",
      "./out/renders/item/" + item.name + " detail.png"
    );
    copyFile(
      "./data/renders/miniitems/" + item.id + ".png",
      "./out/renders/miniitems/" + item.name + ".png"
    );
  }
};
