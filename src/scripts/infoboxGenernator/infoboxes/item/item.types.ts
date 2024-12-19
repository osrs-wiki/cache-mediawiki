import { MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type WeaponSlot =
  | "head"
  | "weapon"
  | "body"
  | "legs"
  | "shield"
  | "cape"
  | "2h"
  | "hands"
  | "feet"
  | "neck"
  | "ammot"
  | "ring";

export type WeaponType =
  | "2h Sword"
  | "Axe"
  | "Banner"
  | "Bladed Staff"
  | "Blaster"
  | "Bludgeon"
  | "Blunt"
  | "Bow"
  | "Bulwark"
  | "Chinchompas"
  | "Claw"
  | "Crossbow"
  | "Gun"
  | "Multi-Style"
  | "Pickaxe"
  | "Polearm"
  | "Polestaff"
  | "Powered Staff"
  | "Salamander"
  | "Scythe"
  | "Slash Sword"
  | "Spear"
  | "Spiked"
  | "Stab Sword"
  | "Staff"
  | "Thrown"
  | "Whip"
  | "Unarmed";

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
