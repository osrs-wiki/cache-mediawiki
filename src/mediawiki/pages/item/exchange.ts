import {
  MediaWikiBuilder,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { Item } from "@/utils/cache2";

const luaString = (value: string | null | undefined): string => {
  if (value == null) {
    return "nil";
  }

  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
};

export const exchangePageBuilder = (item: Item): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContent(
    new MediaWikiText(`return {
    itemId     = ${item.id},
    icon       = ${luaString(`${item.name}.png`)},
    item       = ${luaString(item.name)},
    value      = ${item.price},
    limit      = nil,
    members    = ${item.isMembers},
    category   = nil,
    examine    = ${luaString(item.examine)}
}`)
  );

  return builder;
};