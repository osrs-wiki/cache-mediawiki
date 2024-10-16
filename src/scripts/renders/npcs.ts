import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "../../context";
import { NPC } from "../../utils/cache2";

export const renderNpcs = async (npc: NPC) => {
  if (npc.name.toLocaleLowerCase() === "null") {
    return;
  }
  if (Context.renders && existsSync("./data/renders/npc/" + npc.id + ".png")) {
    await mkdir("./out/renders/npc", { recursive: true });
    copyFile(
      "./data/renders/npc/" + npc.id + ".png",
      "./out/renders/npc/" + npc.name + ".png"
    );
    if (existsSync("./data/renders/chathead/" + npc.id + ".png")) {
      await mkdir("./out/renders/chathead", { recursive: true });
      copyFile(
        "./data/renders/chathead/" + npc.id + ".png",
        "./out/renders/chathead/" + npc.name + ".png"
      );
    }
  }
};
