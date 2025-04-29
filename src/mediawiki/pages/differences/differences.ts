import { MediaWikiBuilder, MediaWikiTOC } from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { IndexFeatures, indexNameMap } from "./differences.types";
import {
  buildArchiveDifferences,
  buildIndexDifferences,
} from "./differences.utils";

import { CacheDifferences } from "@/tasks/differences/differences.types";
import { IndexType } from "@/utils/cache2/types";

/**
 * Retrieve a MediaWikiBuilder filled with content from two cache differences.
 * @param differences The differences between two caches.
 * @returns {MediaWikiBuilder}
 */
const differencesPageBuilder = (
  differences: CacheDifferences
): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContents([new MediaWikiTOC()]);

  // TODO: Build from supported index and archives
  /*Object.keys(indexNameMap).forEach((index) => {
    const indexFeatureMap = indexNameMap[index as unknown as IndexType];
    if (indexFeatureMap) {
      if ("name" in indexFeatureMap) {
        builder.addContents(
          buildArchiveDifferences(differences[index as unknown as IndexType]?.[], indexFeatureMap)
        );
      } else {
        Object.keys(indexFeatureMap).forEach((archive) => {
          const archiveFeatureMap =
            indexFeatureMap[archive as unknown as number];
        });
      }
    }
  });*/

  Object.keys(differences).forEach((index) => {
    const indexFeatureMap = indexNameMap[index as unknown as IndexType];
    if (indexFeatureMap) {
      const indexDifferences = differences[index as unknown as number];
      if ("name" in indexFeatureMap) {
        const indexFeature = indexFeatureMap as IndexFeatures;
        if (Object.keys(indexDifferences).length > 0) {
          builder.addContents(
            buildIndexDifferences(indexDifferences, indexFeature)
          );
        }
      } else {
        Object.keys(indexDifferences).forEach((archive) => {
          const archiveNumber = archive as unknown as number;
          const archiveDifferences = indexDifferences[archiveNumber];
          const indexFeature = indexFeatureMap[archiveNumber];
          if (indexFeature && Object.keys(archiveDifferences).length > 0) {
            builder.addContents(
              buildArchiveDifferences(archiveDifferences, indexFeature)
            );
          }
        });
      }
    }
  });
  return builder;
};

export default differencesPageBuilder;
