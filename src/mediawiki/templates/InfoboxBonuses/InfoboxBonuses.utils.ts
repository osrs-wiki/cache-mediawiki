import { MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { getVersionedImageName } from "../SyncedSwitch";

import { Item, WearPos } from "@/utils/cache2";
import { getBaseName } from "@/utils/string";

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
