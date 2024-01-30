import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import { CacheProvider, Item } from "../../../utils/cache2";

const itemInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const item = await Item.load(cache, id);

    const infoboxItem = new InfoboxTemplate<InfoboxItem>("item", {
      name: item.name as string,
      image: new MediaWikiFile(`${item.name}.png`),
      release: new MediaWikiDate(new Date()),
      update: "",
      members: item.isMembers as boolean,
      quest: "No",
      tradeable: item.isGrandExchangable,
      bankable: item.placeholderLinkedItem > 0,
      placeholder: item.placeholderLinkedItem > 1 ? true : undefined,
      equipable: item.wearpos1 > 0,
      stackable: item.isStackable,
      noteable: item.noteLinkedItem > 0,
      options: item.inventoryActions,
      examine: "",
      value: item.price,
      weight: (item.weight / 1000).toFixed(3),
      id: item.id.toString(),
    });

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("Stub"),
      infoboxItem.build(),
      new MediaWikiFile(`${item.name} detail.png`, {
        horizontalAlignment: "left",
        resizing: { width: 130 },
      }),
      new MediaWikiBreak(),
    ]);

    await mkdir("./out/infobox/item", { recursive: true });
    await writeFile(`./out/infobox/item/${item.id}.txt`, builder.build());
  } catch (e) {
    console.error(`Error generating infobox for item ${id}: `, e);
  }
};

export default itemInfoboxGenerator;
