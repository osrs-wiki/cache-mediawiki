import { WeaponSlot, WeaponType } from "./item.types";
import { Item, ParamID, WearPos } from "../../../utils/cache2";

export const STAB_ATTACK_PARAM: ParamID = 0 as ParamID;
export const SLASH_ATTACK_PARAM: ParamID = 1 as ParamID;
export const CRUSH_ATTACK_PARAM: ParamID = 2 as ParamID;
export const MAGIC_ATTACK_PARAM: ParamID = 3 as ParamID;
export const RANGED_ATTACK_PARAM: ParamID = 4 as ParamID;
export const STAB_DEFENCE_PARAM: ParamID = 5 as ParamID;
export const SLASH_DEFENCE_PARAM: ParamID = 6 as ParamID;
export const CRUSH_DEFENCE_PARAM: ParamID = 7 as ParamID;
export const MAGIC_DEFENCE_PARAM: ParamID = 8 as ParamID;
export const RANGED_DEFENCE_PARAM: ParamID = 9 as ParamID;
export const MELEE_STRENGTH_PARAM: ParamID = 10 as ParamID;
export const PRAYER_BONUS_PARAM: ParamID = 11 as ParamID;
export const RANGED_AMMO_STRENGTH_PARAM: ParamID = 12 as ParamID;
export const ATTACK_RANGE_PARAM: ParamID = 13 as ParamID;
export const ATTACK_SPEED_PARAM: ParamID = 14 as ParamID;
export const RANGED_EQUIPMENT_STRENGTH_PARAM: ParamID = 189 as ParamID;
export const MAGIC_DAMAGE_PARAM: ParamID = 299 as ParamID;

export const formatBonus = (bonus: string | number) => {
  const numberBonus = typeof bonus === "string" ? parseInt(bonus) : bonus;
  return numberBonus > 0 ? `+${bonus}` : numberBonus < 0 ? `-${bonus}` : "0";
};

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

export const getEquipmentSlot = (item: Item): WeaponSlot => {
  if (item.wearpos1 === WearPos.Weapon && item.wearpos2 === WearPos.Shield) {
    return "2h";
  }
  return weaponSlotMap[item.wearpos1];
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
};

export const getWeaponCategory = (item: Item): WeaponType | undefined => {
  return weaponCategoryMap[item.category];
};

export const getInventoryActions = (item: Item) => {
  return item.inventoryActions.map((action, index) => {
    const subops = item.subops[index];
    return subops?.length > 0 ? `${action} (${subops.join(", ")})` : action;
  });
};
