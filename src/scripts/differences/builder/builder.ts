import { MediaWikiBuilder, MediaWikiTOC } from "@osrs-wiki/mediawiki-builder";

import { DifferenceResults } from "../differences.types";

const differencesBuilder = (
  differences: DifferenceResults
): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContents([new MediaWikiTOC()]);

  return builder;
};

export default differencesBuilder;
