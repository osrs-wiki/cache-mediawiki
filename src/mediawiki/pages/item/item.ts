import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { generateItemStackGallery } from "./item.utils";
import Context from "../../../context";
import { CombatStyles, InfoboxBonuses, InfoboxItem } from "../../templates";

import { Item, WearPos } from "@/utils/cache2";
import { getBaseName } from "@/utils/string";

export const itemPageBuilder = (items: Item | Item[]) => {
  // Normalize to array
  const itemArray = Array.isArray(items) ? items : [items];

  // Use the first item as the primary item
  const primaryItem = itemArray[0];
  const baseName = getBaseName(primaryItem.name);

  const infoboxItem = InfoboxItem(itemArray);

  let infoboxBonuses = undefined;
  let combatStyles = undefined;
  if (primaryItem.wearpos1 >= 0) {
    infoboxBonuses = InfoboxBonuses(primaryItem);

    if (primaryItem.wearpos1 === WearPos.Weapon && primaryItem.category > -1) {
      combatStyles = CombatStyles(primaryItem);
    }
  }

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([
    infoboxItem.build(),
    new MediaWikiFile(`${baseName} detail.png`, {
      horizontalAlignment: "left",
      resizing: { width: 130 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(baseName, { bold: true }),
    new MediaWikiText(" is an item."),
  ]);

  if (infoboxBonuses) {
    builder.addContents([
      new MediaWikiBreak(),
      new MediaWikiBreak(),
      new MediaWikiHeader("Combat stats", 2),
      new MediaWikiBreak(),
      infoboxBonuses.build(),
      new MediaWikiBreak(),
    ]);

    if (combatStyles) {
      builder.addContents([combatStyles, new MediaWikiBreak()]);
    }
  }

  if (primaryItem.stackVariantItems.length > 0) {
    builder.addContents(generateItemStackGallery(primaryItem));
  }
  return builder;
};

export default itemPageBuilder;
