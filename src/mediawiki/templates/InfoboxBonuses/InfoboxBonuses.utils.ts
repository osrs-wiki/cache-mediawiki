import { MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { getVersionedImageName } from "../SyncedSwitch";

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
import { getBaseName } from "@/utils/string";

export type InfoboxBonusesData = {
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
  slot: string;
  speed?: string;
  attackrange?: string;
  combatstyle?: string;
  // Image parameters (single item)
  image?: MediaWikiFile;
  altimage?: MediaWikiFile;
  // Image parameters (multiple items)
  image1?: MediaWikiFile;
  image2?: MediaWikiFile;
  image3?: MediaWikiFile;
  altimage1?: MediaWikiFile;
  altimage2?: MediaWikiFile;
  altimage3?: MediaWikiFile;
  [key: string]: string | MediaWikiFile | undefined;
};

/**
 * Formats the given bonus value.
 * @param bonus The bonus to format. Can be a string or a number.
 * @returns A formatted string representing the bonus.
 */
export const formatBonus = (bonus: string | number) => {
  const numberBonus = typeof bonus === "string" ? parseInt(bonus) : bonus;
  return numberBonus > 0 ? `+${bonus}` : numberBonus < 0 ? `${bonus}` : "0";
};

/**
 * Generates image parameters for equipped items.
 * For single items, generates image/altimage parameters.
 * For multiple items, generates image1/image2/image3 and altimage1/altimage2/altimage3 parameters.
 * Does not generate images for ammo or ring slots.
 * @param items Single item or array of items
 * @returns Record of image parameter names to MediaWikiFile objects
 */
export const generateEquippedImageParams = (
  items: Item | Item[]
): Record<string, MediaWikiFile> => {
  const itemArray = Array.isArray(items) ? items : [items];
  const primaryItem = itemArray[0];
  const baseName = getBaseName(primaryItem.name);
  const imageParams: Record<string, MediaWikiFile> = {};

  if (
    primaryItem.wearpos1 !== WearPos.Ammo &&
    primaryItem.wearpos1 !== WearPos.Ring
  ) {
    if (itemArray.length > 1) {
      // Multiple items - create versioned image parameters
      // First add all image variants, then all altimage variants
      itemArray.forEach((_, index) => {
        const versionNum = index + 1;
        imageParams[`image${versionNum}`] = new MediaWikiFile(
          getVersionedImageName(baseName, index, " equipped male")
        );
      });
      itemArray.forEach((_, index) => {
        const versionNum = index + 1;
        imageParams[`altimage${versionNum}`] = new MediaWikiFile(
          getVersionedImageName(baseName, index, " equipped female")
        );
      });
    } else {
      // Single item - use non-versioned parameters
      imageParams.image = new MediaWikiFile(`${baseName} equipped male.png`);
      imageParams.altimage = new MediaWikiFile(
        `${baseName} equipped female.png`
      );
    }
  }

  return imageParams;
};

/**
 * Creates InfoboxBonuses data for a single item.
 * @param item The item to create bonus data for
 * @returns InfoboxBonusesData object with all combat stats
 */
export const createInfoboxBonusesData = (item: Item): InfoboxBonusesData => {
  return {
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
        ? `${item.params.get(ATTACK_SPEED_PARAM) ?? "0"}`
        : undefined,
    attackrange:
      item.wearpos1 === WearPos.Weapon && item.params.has(ATTACK_RANGE_PARAM)
        ? `${item.params.get(ATTACK_RANGE_PARAM) ?? "0"}`
        : undefined,
    combatstyle: getWeaponCategory(item),
  };
};
