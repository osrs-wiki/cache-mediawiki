import { WeaponSlot } from "./item.types";
import { Item, ParamID, WearPos } from "../../../../utils/cache2";

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
export const RANGED_STRENGTH_PARAM: ParamID = 12 as ParamID;
export const ATTACK_RANGE_PARAM: ParamID = 13 as ParamID;
export const ATTACK_SPEED_PARAM: ParamID = 14 as ParamID;
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
