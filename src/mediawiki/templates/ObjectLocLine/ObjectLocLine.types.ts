import { MediaWikiContents } from "@osrs-wiki/mediawiki-builder";

import { MapParams } from "../Map/Map.types";

export interface ObjectLocLineParams extends Omit<MapParams, "name"> {
  name: string;
  location: MediaWikiContents;
  members?: boolean;
  spawns?: string; // Number of spawns (optional)
}
