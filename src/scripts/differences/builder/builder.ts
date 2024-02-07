import { MediaWikiBuilder, MediaWikiTOC } from "@osrs-wiki/mediawiki-builder";

import { IndexType } from "../../../utils/cache2";
import { CacheDifferences } from "../differences.types";

const indexNameMap: {
  [key in IndexType]?: { [key: number]: string } | string;
} = {
  2: {
    6: "Objects",
    9: "Npcs",
    10: "Items",
  },
};

const differencesBuilder = (
  differences: CacheDifferences
): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContents([new MediaWikiTOC()]);

  return builder;
};

export default differencesBuilder;
