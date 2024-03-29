import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import Context from "../../../context";
import { CacheProvider, Item } from "../../../utils/cache2";

const itemInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const item = await Item.load(cache, id);

    buildItemInfobox(item);
  } catch (e) {
    console.error(`Error generating infobox for item ${id}: `, e);
  }
};

export const buildItemInfobox = async (item: Item) => {
  try {
    const infoboxItem = new InfoboxTemplate<InfoboxItem>("item", {
      name: item.name as string,
      image: new MediaWikiFile(`${item.name}.png`),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : undefined,
      update: Context.update,
      members: item.isMembers as boolean,
      quest: "No",
      exchange: item.isGrandExchangable,
      tradeable: item.isGrandExchangable,
      bankable: item.placeholderLinkedItem > 0,
      placeholder: item.placeholderLinkedItem > 1 ? true : undefined,
      equipable: item.wearpos1 > 0,
      stackable: item.isStackable,
      noteable: item.noteLinkedItem > 0,
      options: item.inventoryActions,
      examine: Context.examines?.items ? Context.examines.items[item.id] : "",
      value: item.price,
      weight: (item.weight / 1000).toFixed(3),
      id: item.id.toString(),
    });

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("New Content"),
      infoboxItem.build(),
      new MediaWikiFile(`${item.name} detail.png`, {
        horizontalAlignment: "left",
        resizing: { width: 130 },
      }),
      new MediaWikiBreak(),
    ]);

    await mkdir("./out/infobox/item", { recursive: true });
    writeFile(`./out/infobox/item/${item.id}.txt`, builder.build());
  } catch (e) {
    console.error("Error building item infobox: ", e);
  }
};

export default itemInfoboxGenerator;
