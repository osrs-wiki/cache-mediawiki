import { WeaponSlot } from "./item.types";
import { Item, WearPos } from "../../../../utils/cache2";

export const STAB_ATTACK_PARAM = 0;
export const SLASH_ATTACK_PARAM = 1;
export const CRUSH_ATTACK_PARAM = 2;
export const MAGIC_ATTACK_PARAM = 3;
export const RANGED_ATTACK_PARAM = 4;
export const STAB_DEFENCE_PARAM = 5;
export const SLASH_DEFENCE_PARAM = 6;
export const CRUSH_DEFENCE_PARAM = 7;
export const MAGIC_DEFENCE_PARAM = 8;
export const RANGED_DEFENCE_PARAM = 9;
export const MELEE_STRENGTH_PARAM = 10;
export const PRAYER_BONUS_PARAM = 11;
export const RANGED_STRENGTH_PARAM = 12;
export const ATTACK_RANGE_PARAM = 13;
export const ATTACK_SPEED_PARAM = 14;
export const MAGIC_DAMAGE_PARAM = 299;

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
