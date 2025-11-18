import { InfoboxTemplate } from "@osrs-wiki/mediawiki-builder";

import {
  formatBonus,
  generateEquippedImageParams,
} from "./InfoboxBonuses.utils";

import { getEquipmentSlot, getWeaponCategory } from "@/types/item";
import {
  ATTACK_RANGE_PARAM,
  ATTACK_SPEED_PARAM,
  CRUSH_ATTACK_PARAM,
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DAMAGE_PARAM,
  MAGIC_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  PRAYER_BONUS_PARAM,
  RANGED_AMMO_STRENGTH_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  RANGED_EQUIPMENT_STRENGTH_PARAM,
  SLASH_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
} from "@/types/params";
import { Item, WearPos } from "@/utils/cache2";

const InfoboxBonuses = (items: Item | Item[]) => {
  // Normalize to array
  const itemArray = Array.isArray(items) ? items : [items];
  const primaryItem = itemArray[0];

  // Generate versioned image parameters for equipped items
  const imageParams = generateEquippedImageParams(items);

  return new InfoboxTemplate("bonuses", {
    astab: primaryItem.params.has(STAB_ATTACK_PARAM)
      ? formatBonus(primaryItem.params.get(STAB_ATTACK_PARAM))
      : "0",
    aslash: primaryItem.params.has(SLASH_ATTACK_PARAM)
      ? formatBonus(primaryItem.params.get(SLASH_ATTACK_PARAM))
      : "0",
    acrush: primaryItem.params.has(CRUSH_ATTACK_PARAM)
      ? formatBonus(primaryItem.params.get(CRUSH_ATTACK_PARAM))
      : "0",
    amagic: primaryItem.params.has(MAGIC_ATTACK_PARAM)
      ? formatBonus(primaryItem.params.get(MAGIC_ATTACK_PARAM))
      : "0",
    arange: primaryItem.params.has(RANGED_ATTACK_PARAM)
      ? formatBonus(primaryItem.params.get(RANGED_ATTACK_PARAM))
      : "0",
    dstab: primaryItem.params.has(STAB_DEFENCE_PARAM)
      ? formatBonus(primaryItem.params.get(STAB_DEFENCE_PARAM))
      : "0",
    dslash: primaryItem.params.has(SLASH_DEFENCE_PARAM)
      ? formatBonus(primaryItem.params.get(SLASH_DEFENCE_PARAM))
      : "0",
    dcrush: primaryItem.params.has(CRUSH_DEFENCE_PARAM)
      ? formatBonus(primaryItem.params.get(CRUSH_DEFENCE_PARAM))
      : "0",
    dmagic: primaryItem.params.has(MAGIC_DEFENCE_PARAM)
      ? formatBonus(primaryItem.params.get(MAGIC_DEFENCE_PARAM))
      : "0",
    drange: primaryItem.params.has(RANGED_DEFENCE_PARAM)
      ? formatBonus(primaryItem.params.get(RANGED_DEFENCE_PARAM))
      : "0",
    str: primaryItem.params.has(MELEE_STRENGTH_PARAM)
      ? formatBonus(primaryItem.params.get(MELEE_STRENGTH_PARAM))
      : "0",
    rstr: primaryItem.params.has(RANGED_AMMO_STRENGTH_PARAM)
      ? formatBonus(primaryItem.params.get(RANGED_AMMO_STRENGTH_PARAM))
      : primaryItem.params.has(RANGED_EQUIPMENT_STRENGTH_PARAM)
      ? formatBonus(primaryItem.params.get(RANGED_EQUIPMENT_STRENGTH_PARAM))
      : "0",
    mdmg: primaryItem.params.has(MAGIC_DAMAGE_PARAM)
      ? `${
          parseInt(primaryItem.params.get(MAGIC_DAMAGE_PARAM).toString()) / 10
        }`
      : "0",
    prayer: primaryItem.params.has(PRAYER_BONUS_PARAM)
      ? formatBonus(primaryItem.params.get(PRAYER_BONUS_PARAM))
      : "0",
    slot: getEquipmentSlot(primaryItem),
    speed:
      primaryItem.wearpos1 === WearPos.Weapon &&
      primaryItem.params.has(ATTACK_SPEED_PARAM)
        ? primaryItem.params.get(ATTACK_SPEED_PARAM) ?? "0"
        : undefined,
    attackrange:
      primaryItem.wearpos1 === WearPos.Weapon &&
      primaryItem.params.has(ATTACK_RANGE_PARAM)
        ? primaryItem.params.get(ATTACK_RANGE_PARAM) ?? "0"
        : undefined,
    combatstyle: getWeaponCategory(primaryItem),
    ...imageParams,
  });
};

export default InfoboxBonuses;
