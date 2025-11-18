import { MediaWikiFile, MediaWikiHTML } from "@osrs-wiki/mediawiki-builder";

import { Item } from "@/utils/cache2";

/**
 * Get the inventory actions for a given item.
 * @param item The item to get inventory actions for.
 * @returns An array of inventory actions, possibly with sub-operations included.
 */
export const getInventoryActions = (item: Item) => {
  return item.inventoryActions
    .map((action, index) => {
      const subops = item.subops?.[index];
      return subops?.length > 0
        ? `${action} (${subops.join(", ")})`
        : action?.trim();
    })
    .filter((action) => action && action.trim() !== "");
};

/**
 * Get the item infobox image for a given item, with support for stack variants and versioning.
 * If the item has no stack variants, it returns a single image.
 * If it has stack variants, it returns an array of images, inserting a break
 * after the first half if there are 5 or more variants.
 * @param item The item to get the infobox image for.
 * @param baseName The base name of the item (without parenthetical suffixes)
 * @param index The index of this item in a multi-item array (0 for first item)
 * @returns The infobox image for the item.
 */
export const getItemInfoboxImage = (
  item: Item,
  baseName?: string,
  index = 0
) => {
  const displayName = baseName || item.name;
  const versionSuffix = index > 0 ? ` (${index + 1})` : "";

  const filteredVariants = item.stackVariantItems.filter((id) => id !== 0);
  if (filteredVariants.length === 0) {
    return new MediaWikiFile(`${displayName}${versionSuffix}.png`);
  } else {
    const variantFiles = [
      new MediaWikiFile(`${displayName}${versionSuffix} 1.png`),
      ...filteredVariants.map(
        (_variantId, variantIndex) =>
          new MediaWikiFile(
            `${displayName}${versionSuffix} ${item.stackVariantQuantities[variantIndex]}.png`
          )
      ),
    ];
    if (variantFiles.length > 5) {
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
