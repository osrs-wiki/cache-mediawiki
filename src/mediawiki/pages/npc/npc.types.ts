import { NPC } from "@/utils/cache2";

export type NpcGroup = {
  type: "npc" | "monster";
  npcs: NPC[];
  label: string;
};
