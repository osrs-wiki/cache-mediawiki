import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "../../context";
import { NPC } from "../../utils/cache2";
import { formatFileName } from "../../utils/files";

export const renderNpcs = async (npc: NPC) => {
  if (npc.name.toLocaleLowerCase() === "null") {
    return;
  }
  try {
    if (
      Context.renders &&
      existsSync(`./data/${Context.renders}/npc/${npc.id}.png`)
    ) {
      await mkdir(`./out/${Context.renders}/npc`, { recursive: true });
      await copyFile(
        `./data/${Context.renders}/npc/${npc.id}.png`,
        formatFileName(`./out/${Context.renders}/npc/${npc.name}.png`)
      );
      if (existsSync(`./data/${Context.renders}/chathead/${npc.id}.png`)) {
        await mkdir(`./out/${Context.renders}/chathead`, { recursive: true });
        await copyFile(
          `./data/${Context.renders}/chathead/${npc.id}.png`,
          formatFileName(
            `./out/${Context.renders}/chathead/${npc.name} chathead.png`
          )
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
