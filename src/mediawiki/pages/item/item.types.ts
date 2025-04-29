import { MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { WeaponSlot } from "../../../types/item/item";

export type InfoboxBonuses = {
  astab: string;
  aslash: string;
  acrush: string;
  amagic: string;
  arange: string;
  dstab: string;
  dslash: string;
  dcrush: string;
  dmagic: string;
  drange: string;
  str: string;
  rstr: string;
  mdmg: string;
  prayer: string;
  slot: WeaponSlot;
  speed?: number | "N/A";
  attackrange?: number | "No" | "staff";
  image?: MediaWikiFile;
  caption?: string;
  altimage?: MediaWikiFile;
  altcaption?: string;
};
