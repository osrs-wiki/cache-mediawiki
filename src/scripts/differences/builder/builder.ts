import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiContent,
  MediaWikiHeader,
  MediaWikiTOC,
  MediaWikiTable,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import type { MediaWikiTableRow } from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { IndexFeatures, indexNameMap } from "./builder.types";
import { IndexType } from "../../../utils/cache2";
import {
  ArchiveDifferences,
  CacheDifferences,
  Result,
} from "../differences.types";

const differencesBuilder = (
  differences: CacheDifferences
): MediaWikiBuilder => {
  const builder = new MediaWikiBuilder();

  builder.addContents([new MediaWikiTOC()]);

  Object.keys(differences).forEach((index) => {
    const indexFeatureMap = indexNameMap[index as unknown as IndexType];
    if (indexFeatureMap) {
      const archives = differences[index as unknown as number];
      Object.keys(archives).forEach((archive) => {
        const archiveNumber = archive as unknown as number;
        const archiveDifferences = archives[archiveNumber];
        const indexFeature =
          "name" in indexFeatureMap
            ? indexFeatureMap
            : indexFeatureMap[archiveNumber];
        if (indexFeature) {
          builder.addContents(
            buildArchiveDifferences(archiveDifferences, indexFeature)
          );
        }
      });
    }
  });

  return builder;
};

const buildArchiveDifferences = (
  archiveDifferences: ArchiveDifferences,
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const tableFields = indexFeatures.fields.map((field) => field.toString());
  const content: MediaWikiContent[] = [
    new MediaWikiHeader(indexFeatures.name, 2),
    new MediaWikiBreak(),
  ];

  const added: Result[] = _.pluck(
    Object.values(archiveDifferences),
    "added"
  ).filter((added) => added !== null && added !== undefined);
  console.log(`Added: ${JSON.stringify(added)}`);
  if (added?.length > 0) {
    const addedEntries: MediaWikiTableRow[] = added.map((entry) => {
      const fields = Object.keys(entry).filter((key) =>
        tableFields.includes(key)
      );
      return {
        cells: fields.map((field) => ({
          content: [new MediaWikiText(JSON.stringify(entry[field]))],
        })),
        minimal: true,
      };
    });

    content.push(
      new MediaWikiHeader(`New ${indexFeatures.name}`, 3),
      new MediaWikiBreak(),
      new MediaWikiTable({
        rows: [
          {
            header: true,
            minimal: true,
            cells: [
              {
                content: [new MediaWikiText(`New ${indexFeatures.name}`)],
                options: {
                  colspan: indexFeatures.fields.length + 1,
                },
              },
            ],
          },
          {
            header: true,
            minimal: true,
            cells: indexFeatures.fields.map((field) => ({
              content: [new MediaWikiText(field)],
            })),
            options: {
              style: "width: 15em",
            },
          },
          ...addedEntries,
        ],
      }),
      new MediaWikiBreak()
    );
  }

  return content;
};

export default differencesBuilder;
