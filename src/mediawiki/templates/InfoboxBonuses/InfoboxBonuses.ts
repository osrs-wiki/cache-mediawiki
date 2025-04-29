import { InfoboxTemplate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { formatBonus } from "./InfoboxBonuses.utils";
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
  getEquipmentSlot,
  getWeaponCategory,
} from "../../../types/item";
import { Item, WearPos } from "../../../utils/cache2";

const InfoboxBonuses = (item: Item) => {
  return new InfoboxTemplate("bonuses", {
    astab: item.params.has(STAB_ATTACK_PARAM)
      ? formatBonus(item.params.get(STAB_ATTACK_PARAM))
      : "0",
    aslash: item.params.has(SLASH_ATTACK_PARAM)
      ? formatBonus(item.params.get(SLASH_ATTACK_PARAM))
      : "0",
    acrush: item.params.has(CRUSH_ATTACK_PARAM)
      ? formatBonus(item.params.get(CRUSH_ATTACK_PARAM))
      : "0",
    amagic: item.params.has(MAGIC_ATTACK_PARAM)
      ? formatBonus(item.params.get(MAGIC_ATTACK_PARAM))
      : "0",
    arange: item.params.has(RANGED_ATTACK_PARAM)
      ? formatBonus(item.params.get(RANGED_ATTACK_PARAM))
      : "0",
    dstab: item.params.has(STAB_DEFENCE_PARAM)
      ? formatBonus(item.params.get(STAB_DEFENCE_PARAM))
      : "0",
    dslash: item.params.has(SLASH_DEFENCE_PARAM)
      ? formatBonus(item.params.get(SLASH_DEFENCE_PARAM))
      : "0",
    dcrush: item.params.has(CRUSH_DEFENCE_PARAM)
      ? formatBonus(item.params.get(CRUSH_DEFENCE_PARAM))
      : "0",
    dmagic: item.params.has(MAGIC_DEFENCE_PARAM)
      ? formatBonus(item.params.get(MAGIC_DEFENCE_PARAM))
      : "0",
    drange: item.params.has(RANGED_DEFENCE_PARAM)
      ? formatBonus(item.params.get(RANGED_DEFENCE_PARAM))
      : "0",
    str: item.params.has(MELEE_STRENGTH_PARAM)
      ? formatBonus(item.params.get(MELEE_STRENGTH_PARAM))
      : "0",
    rstr: item.params.has(RANGED_AMMO_STRENGTH_PARAM)
      ? formatBonus(item.params.get(RANGED_AMMO_STRENGTH_PARAM))
      : item.params.has(RANGED_EQUIPMENT_STRENGTH_PARAM)
      ? formatBonus(item.params.get(RANGED_EQUIPMENT_STRENGTH_PARAM))
      : "0",
    mdmg: item.params.has(MAGIC_DAMAGE_PARAM)
      ? `${parseInt(item.params.get(MAGIC_DAMAGE_PARAM).toString()) / 10}`
      : "0",
    prayer: item.params.has(PRAYER_BONUS_PARAM)
      ? formatBonus(item.params.get(PRAYER_BONUS_PARAM))
      : "0",
    slot: getEquipmentSlot(item),
    speed:
      item.wearpos1 === WearPos.Weapon && item.params.has(ATTACK_SPEED_PARAM)
        ? item.params.get(ATTACK_SPEED_PARAM) ?? "0"
        : undefined,
    attackrange:
      item.wearpos1 === WearPos.Weapon && item.params.has(ATTACK_RANGE_PARAM)
        ? item.params.get(ATTACK_RANGE_PARAM) ?? "0"
        : undefined,
    combatstyle: getWeaponCategory(item),
    ...(item.wearpos1 !== WearPos.Ammo && item.wearpos1 !== WearPos.Ring
      ? {
          image: new MediaWikiFile(`${item.name} equipped male.png`),
          altimage: new MediaWikiFile(`${item.name} equipped female.png`),
        }
      : {}),
  });
};

export default InfoboxBonuses;
