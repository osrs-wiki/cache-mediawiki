import { MediaWikiDate } from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem as InfoboxItemType } from "@osrs-wiki/mediawiki-builder";

import { getInventoryActions, getItemInfoboxImage } from "./InfoboxItem.utils";
import { InfoboxTemplate } from "../InfoboxTemplate";

import Context from "@/context";
import { NO_ALCHABLE_PARAM } from "@/types/params";
import { Item } from "@/utils/cache2";
import { getBaseName } from "@/utils/string";

/**
 * Creates InfoboxItem data for a single item
 */
const createInfoboxItemData = (item: Item, index = 0): InfoboxItemType => {
  const baseName = getBaseName(item.name);

  return {
    name: item.name as string,
    image: getItemInfoboxImage(item, baseName, index),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: item.isMembers as boolean,
    quest: "No",
    exchange: Context.beta ? false : item.isGrandExchangable,
    tradeable: item.isGrandExchangable,
    bankable: item.placeholderLinkedItem > 0,
    placeholder: item.placeholderLinkedItem > 1 ? true : undefined,
    equipable: item.wearpos1 >= 0,
    stackable: item.isStackable,
    noteable: item.noteLinkedItem > 0,
    options: getInventoryActions(item),
    examine: item.examine,
    value: item.price,
    alchable: item.params?.get(NO_ALCHABLE_PARAM) === 1 ? false : undefined,
    weight: (item.weight / 1000).toFixed(3),
    id: `${Context.beta ? "beta" : ""}${item.id?.toString()}`,
  };
};

const InfoboxItem = (items: Item | Item[]) => {
  const itemArray = Array.isArray(items) ? items : [items];

  if (itemArray.length === 1) {
    // Single item - existing behavior
    const infoboxData = createInfoboxItemData(itemArray[0]);
    return new InfoboxTemplate<InfoboxItemType>("item", infoboxData);
  } else {
    // Multiple items
    const infoboxDataArray = itemArray.map((item, index) =>
      createInfoboxItemData(item, index)
    );
    return new InfoboxTemplate<InfoboxItemType>("item", infoboxDataArray);
  }
};

export default InfoboxItem;
