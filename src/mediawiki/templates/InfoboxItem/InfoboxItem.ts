import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem as InfoboxItemTemplate } from "@osrs-wiki/mediawiki-builder";

import { getInventoryActions } from "./InfoboxItem.utils";
import Context from "../../../context";
import { Item } from "../../../utils/cache2";

const InfoboxItem = (item: Item) => {
  return new InfoboxTemplate<InfoboxItemTemplate>("item", {
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
    options: getInventoryActions(item),
    examine: item.examine,
    value: item.price,
    weight: (item.weight / 1000).toFixed(3),
    id: item.id.toString(),
  });
};

export default InfoboxItem;
