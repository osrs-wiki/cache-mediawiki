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
      existsSync("./data/renders/npc/" + npc.id + ".png")
    ) {
      await mkdir("./out/renders/npc", { recursive: true });
      await copyFile(
        "./data/renders/npc/" + npc.id + ".png",
        formatFileName("./out/renders/npc/" + npc.name + ".png")
      );
      if (existsSync("./data/renders/chathead/" + npc.id + ".png")) {
        await mkdir("./out/renders/chathead", { recursive: true });
        await copyFile(
          "./data/renders/chathead/" + npc.id + ".png",
          formatFileName("./out/renders/chathead/" + npc.name + " chathead.png")
        );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
