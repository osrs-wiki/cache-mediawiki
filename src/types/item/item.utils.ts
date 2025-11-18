import { WeaponSlot, WeaponType } from "./item";

import { Item, WearPos } from "@/utils/cache2";

const weaponSlotMap: { [key: WearPos]: WeaponSlot } = {
  [WearPos.Weapon]: "weapon",
  [WearPos.Head]: "head",
  [WearPos.Torso]: "body",
  [WearPos.Legs]: "legs",
  [WearPos.Shield]: "shield",
  [WearPos.Cape]: "cape",
  [WearPos.Ammo]: "ammot",
  [WearPos.Hands]: "hands",
  [WearPos.Boots]: "feet",
  [WearPos.Amulet]: "neck",
  [WearPos.Ring]: "ring",
};

const weaponCategoryMap: { [key: number]: WeaponType } = {
  0: "Unarmed",
  1: "Staff",
  15: "Bow",
  21: "Slash Sword",
  24: "Thrown",
  25: "Stab Sword",
  26: "Blunt",
  35: "Axe",
  36: "Spear",
  37: "Crossbow",
  39: "Spiked",
  42: "Banner",
  55: "Blunt",
  61: "2h Sword",
  64: "Bow",
  65: "Claw",
  66: "Polearm",
  67: "Pickaxe",
  92: "Polearm",
  96: "Gun",
  106: "Bow",
  150: "Whip",
  273: "Polearm",
  572: "Chinchompas",
  587: "Crossbow",
  586: "Salamander",
  1014: "Bulwark",
  1193: "Scythe",
  1588: "Partisan",
  //2294: "Crate",
};

/**
 * Get the equipment slot name for a given item.
 * @param item The item to get the equipment slot for.
 * @returns The equipment slot name for the item.
 */
export const getEquipmentSlot = (item: Item): WeaponSlot => {
  if (item.wearpos1 === WearPos.Weapon && item.wearpos2 === WearPos.Shield) {
    return "2h";
  }
  return weaponSlotMap[item.wearpos1];
};

/**
 * Get the weapon category for a given item.
 * @param item The item to get the weapon category for.
 * @returns The weapon category for the item.
 */
export const getWeaponCategory = (item: Item): WeaponType | undefined => {
  return weaponCategoryMap[item.category] ?? "Unarmed";
};
