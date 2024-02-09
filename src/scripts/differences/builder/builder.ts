import {
  MediaWikiBuilder,
  MediaWikiContent,
  MediaWikiTOC,
} from "@osrs-wiki/mediawiki-builder";

import { IndexFeatures, indexNameMap } from "./builder.types";
import { IndexType } from "../../../utils/cache2";
import { ArchiveDifferences, CacheDifferences } from "../differences.types";

const differencesBuilder = (
  differences: CacheDifferences
): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContents([new MediaWikiTOC()]);

  Object.keys(differences).forEach((index) => {
    const indexFeatureMap = indexNameMap[index as unknown as IndexType];
    const archives = differences[index as unknown as number];
    Object.keys(archives).forEach((archive) => {
      const archiveNumber = archive as unknown as number;
      const archiveDifferences = archives[archiveNumber];
      const indexFeature =
        "name" in indexFeatureMap
          ? indexFeatureMap
          : indexFeatureMap[archiveNumber];
      builder.addContents(
        buildArchiveDifferences(archiveDifferences, indexFeature)
      );
    });
  });

  return builder;
};

const buildArchiveDifferences = (
  archiveDifferences: ArchiveDifferences,
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const content: MediaWikiContent[] = [];

  return content;
};

export default differencesBuilder;
