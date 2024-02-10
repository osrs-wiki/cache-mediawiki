import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiContent,
  MediaWikiHeader,
  MediaWikiTOC,
  MediaWikiTable,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import type {
  MediaWikiTableCell,
  MediaWikiTableRow,
} from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { IndexFeatures, indexNameMap, resultNameMap } from "./builder.types";
import { formatEntryValue } from "./builder.utils";
import { IndexType } from "../../../utils/cache2";
import {
  ArchiveDifferences,
  CacheDifferences,
  ChangedResult,
  Difference,
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
  const content: MediaWikiContent[] = [
    new MediaWikiHeader(indexFeatures.name, 2),
    new MediaWikiBreak(),
    ...buildFullResultTable(archiveDifferences, indexFeatures, "added"),
    ...buildFullResultTable(archiveDifferences, indexFeatures, "removed"),
    ...buildChangedResultTable(archiveDifferences, indexFeatures),
  ];

  return content;
};

const buildChangedResultTable = (
  archiveDifferences: ArchiveDifferences,
  indexFeatures: IndexFeatures
) => {
  const differenceName = resultNameMap.changed;
  const content: MediaWikiContent[] = [];
  const entries: ChangedResult[] = _.pluck(
    Object.values(archiveDifferences),
    "changed"
  ).filter((entry) => entry !== null && entry !== undefined);

  if (entries?.length > 0) {
    const rows: MediaWikiTableRow[] = entries
      .map<MediaWikiTableRow[]>((entry) => {
        const diffLength = Object.keys(entry).length;
        return [
          {
            cells: indexFeatures.identifiers.map<MediaWikiTableCell>(
              (identifier) => ({
                content: [
                  new MediaWikiText(
                    formatEntryValue(entry?.[identifier]?.newValue)
                  ),
                ],
                options: {
                  rowspan: diffLength,
                },
              })
            ),
            minimal: true,
          },
          ...Object.keys(entry)
            .filter(
              (key) => !(indexFeatures.identifiers as string[]).includes(key)
            )
            .map<MediaWikiTableRow>((field) => ({
              cells: [
                {
                  content: [new MediaWikiText(field)],
                },
                {
                  content: [
                    new MediaWikiText(formatEntryValue(entry[field].oldValue)),
                  ],
                },
                {
                  content: [
                    new MediaWikiText(formatEntryValue(entry[field].newValue)),
                  ],
                },
              ],
              minimal: true,
            })),
        ];
      })
      .flat();

    content.push(
      new MediaWikiHeader(`${differenceName} ${indexFeatures.name}`, 3),
      new MediaWikiBreak(),
      new MediaWikiTable({
        rows: [
          {
            header: true,
            minimal: true,
            cells: [
              {
                content: [
                  new MediaWikiText(`${differenceName} ${indexFeatures.name}`),
                ],
                options: {
                  colspan: 5,
                },
              },
            ],
          },
          {
            header: true,
            minimal: true,
            cells: ["Name", "ID", "Key", "Previous Value", "New Value"].map(
              (column) => ({
                content: [new MediaWikiText(column)],
              })
            ),
          },
          ...rows,
        ],
      }),
      new MediaWikiBreak()
    );
  }
  return content;
};

const buildFullResultTable = (
  archiveDifferences: ArchiveDifferences,
  indexFeatures: IndexFeatures,
  type: Difference
): MediaWikiContent[] => {
  const differenceName = resultNameMap[type];
  const tableFields = indexFeatures.fields.map((field) => field.toString());
  const content: MediaWikiContent[] = [];
  const entries: Result[] = _.pluck(
    Object.values(archiveDifferences),
    type
  ).filter((entry) => entry !== null && entry !== undefined);

  if (entries?.length > 0) {
    const rows: MediaWikiTableRow[] = entries.map((entry) => {
      return {
        cells: tableFields.map((field) => ({
          content: [new MediaWikiText(formatEntryValue(entry[field]))],
        })),
        minimal: true,
      };
    });

    content.push(
      new MediaWikiHeader(`${differenceName} ${indexFeatures.name}`, 3),
      new MediaWikiBreak(),
      new MediaWikiTable({
        rows: [
          {
            header: true,
            minimal: true,
            cells: [
              {
                content: [
                  new MediaWikiText(`${differenceName} ${indexFeatures.name}`),
                ],
                options: {
                  colspan: indexFeatures.fields.length,
                },
              },
            ],
          },
          {
            header: true,
            minimal: true,
            cells: [...indexFeatures.identifiers, ...indexFeatures.fields].map(
              (field) => ({
                content: [new MediaWikiText(field)],
              })
            ),
          },
          ...rows,
        ],
      }),
      new MediaWikiBreak()
    );
  }
  return content;
};

export default differencesBuilder;
