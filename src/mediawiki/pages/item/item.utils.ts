import {
  MediaWikiBreak,
  MediaWikiContent,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiHTML,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { Item } from "../../../utils/cache2";

/**
 * Generate a gallery of item stack variants.
 * @param item The item to generate the gallery for.
 * @returns An array of MediaWiki content for the gallery.
 */
export const generateItemStackGallery = (item: Item): MediaWikiContent[] => {
  if (item.stackVariantItems.length === 0) {
    return [];
  }
  return [
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Gallery", 2),
    new MediaWikiBreak(),
    new MediaWikiHTML(
      "gallery",
      [
        new MediaWikiFile(`${item.name} 1 detail.png`),
        new MediaWikiText(`|1 ${item.name}`),
        new MediaWikiBreak(),
      ].concat(
        item.stackVariantItems
          .filter((id) => id !== 0)
          .map((_id, index) =>
            [
              new MediaWikiFile(
                `${item.name} ${item.stackVariantQuantities[index]} detail.png`
              ),
              new MediaWikiText(
                `|${item.stackVariantQuantities[index]} ${item.name}`
              ),
            ].concat(
              index < item.stackVariantItems.length - 2
                ? [new MediaWikiBreak()]
                : []
            )
          )
          .flat()
      ),
      {
        captionalign: "center",
        widths: "120",
      }
    ),
  ];
};
