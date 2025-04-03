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
      existsSync(`./data/${Context.renders}/item/${item.id}.png`)
    ) {
      await mkdir(`./out/${Context.renders}/item`, { recursive: true });
      await mkdir(`./out/${Context.renders}/miniitems`, { recursive: true });
      await copyFile(
        `./data/${Context.renders}/item/${item.id}.png`,
        formatFileName(`./out/${Context.renders}/item/${item.name} detail.png`)
      );
      await copyFile(
        `./data/${Context.renders}/miniitems/${item.id}.png`,
        formatFileName(`./out/${Context.renders}/miniitems/${item.name}.png`)
      );
    }
  } catch (e) {
    console.error(e);
  }
};
