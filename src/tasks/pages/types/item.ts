import Context from "../../../context";
import { renderItems } from "../../renders";
import { writePageToFile } from "../pages.utils";

import { itemPageBuilder } from "@/mediawiki/pages/item";
import { CacheProvider, Item } from "@/utils/cache2";

export const writeItemPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const item = await Item.load(cache, id);

    if (item) {
      writeItemPage(item);
    }
  } catch (e) {
    console.error(`Error generating page for item ${id}: `, e);
  }
};

export const writeItemPage = async (item: Item) => {
  const builder = itemPageBuilder(item);
  writePageToFile(builder, "item", item.name, item.id.toString());

  if (Context.renders) {
    renderItems(item);
  }
};
