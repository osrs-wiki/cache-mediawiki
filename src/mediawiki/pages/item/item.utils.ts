import {
  MediaWikiBreak,
  MediaWikiContent,
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
  const filteredStackVariants = item.stackVariantItems.filter((id) => id !== 0);
  const filteredStackQuantities = item.stackVariantQuantities.filter(
    (quantity) => quantity !== 0
  );
  if (filteredStackVariants.length === 0) {
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
        new MediaWikiText(`File:${item.name} 1 detail.png`),
        new MediaWikiText(`|1 ${item.name}`),
        new MediaWikiBreak(),
      ].concat(
        filteredStackVariants
          .map((_id, index) =>
            [
              new MediaWikiText(
                `File:${item.name}${
                  index < filteredStackQuantities.length - 1
                    ? ` ${filteredStackQuantities[index]}`
                    : ""
                } detail.png`
              ),
              new MediaWikiText(
                `|${filteredStackQuantities[index]} ${item.name}`
              ),
            ].concat(
              index < filteredStackVariants.length - 1
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
