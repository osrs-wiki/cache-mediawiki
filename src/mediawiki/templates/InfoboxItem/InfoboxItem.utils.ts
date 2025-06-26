import { MediaWikiFile, MediaWikiHTML } from "@osrs-wiki/mediawiki-builder";

import { Item } from "@/utils/cache2";

/**
 * Get the inventory actions for a given item.
 * @param item The item to get inventory actions for.
 * @returns An array of inventory actions, possibly with sub-operations included.
 */
export const getInventoryActions = (item: Item) => {
  return item.inventoryActions?.map((action, index) => {
    const subops = item.subops?.[index];
    return subops?.length > 0 ? `${action} (${subops.join(", ")})` : action;
  });
};

/**
 * Get the item infobox image for a given item, with support for stack variants.
 * If the item has no stack variants, it returns a single image.
 * If it has stack variants, it returns an array of images, inserting a break
 * after the first half if there are 5 or more variants.
 * @param item The item to get the infobox image for.
 * @returns The infobox image for the item.
 */
export const getItemInfoboxImage = (item: Item) => {
  const filteredVariants = item.stackVariantItems.filter((id) => id !== 0);
  if (filteredVariants.length === 0) {
    return new MediaWikiFile(`${item.name}.png`);
  } else {
    const variantFiles = filteredVariants.map(
      (_variantId, index) =>
        new MediaWikiFile(
          `${item.name} ${item.stackVariantQuantities[index]}.png`
        )
    );
    if (variantFiles.length >= 5) {
      const half = Math.floor(variantFiles.length / 2);
      return [
        ...variantFiles.slice(0, half),
        new MediaWikiHTML("br"),
        ...variantFiles.slice(half),
      ];
    } else {
      return variantFiles;
    }
  }
};
