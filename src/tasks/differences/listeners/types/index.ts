import { areaListener } from "./areas";
import { itemListener } from "./items";
import { musicListener } from "./music";
import { npcListener } from "./npcs";
import { objectListener } from "./objects";
import { questListener } from "./quest";
import { CacheChangeListener } from "../listeners.types";

export const cacheListeners: CacheChangeListener[] = [
  areaListener,
  itemListener,
  musicListener,
  npcListener,
  objectListener,
  questListener,
];
