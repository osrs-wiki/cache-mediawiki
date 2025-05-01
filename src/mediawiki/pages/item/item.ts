import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { CombatStyles, InfoboxBonuses, InfoboxItem } from "../../templates";

import { Item, WearPos } from "@/utils/cache2";

export const itemPageBuilder = (item: Item) => {
  const infoboxItem = InfoboxItem(item);

  let infoboxBonuses = undefined;
  let combatStyles = undefined;
  if (item.wearpos1 >= 0) {
    infoboxBonuses = InfoboxBonuses(item);

    if (item.wearpos1 === WearPos.Weapon && item.category > -1) {
      combatStyles = CombatStyles(item);
    }
  }

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxItem.build(),
    new MediaWikiFile(`${item.name} detail.png`, {
      horizontalAlignment: "left",
      resizing: { width: 130 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(item.name, { bold: true }),
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
  return builder;
};

export default itemPageBuilder;
