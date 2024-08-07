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
import {
  formatEntryIdentifier,
  formatEntryValue,
  getFieldDifferencesRow,
} from "./builder.utils";
import { IndexType } from "../../../utils/cache2";
import {
  NamedPerArchiveLoadable,
  PerArchiveLoadable,
} from "../../../utils/cache2/Loadable";
import { capitalize } from "../../../utils/string";
import {
  ArchiveDifferences,
  CacheDifferences,
  ChangedResult,
  Difference,
  IndexDifferences,
  Result,
} from "../differences.types";

/**
 * Retrieve a MediaWikiBuilder filled with content from two cache differences.
 * @param differences The differences between two caches.
 * @returns {MediaWikiBuilder}
 */
const differencesBuilder = (
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
        builder.addContents(
          buildIndexDifferences(indexDifferences, indexFeature)
        );
      } else {
        Object.keys(indexDifferences).forEach((archive) => {
          const archiveNumber = archive as unknown as number;
          const archiveDifferences = indexDifferences[archiveNumber];
          const indexFeature = indexFeatureMap[archiveNumber];
          if (indexFeature) {
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

/**
 * Build the media wiki content for the differences in two cache index's archives.
 * @param indexDifferences Differences between two cache's index's archives.
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
const buildIndexDifferences = (
  indexDifferences: IndexDifferences,
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const fileDifferences = Object.values(indexDifferences).map(
    (archive) => archive[0]
  );
  const addedResults: Result[] = _.pluck(fileDifferences, "added").filter(
    (entry) => entry !== null && entry !== undefined
  );

  const removedResults: Result[] = _.pluck(fileDifferences, "removed").filter(
    (entry) => entry !== null && entry !== undefined
  );

  const changedResults: ChangedResult[] = _.pluck(
    fileDifferences,
    "changed"
  ).filter(
    (entry) =>
      entry !== null && entry !== undefined && Object.keys(entry).length > 0
  );

  const content: MediaWikiContent[] = [
    new MediaWikiHeader(indexFeatures.name, 2),
    new MediaWikiBreak(),
    ...buildResultTable(addedResults, indexFeatures, "added"),
    ...buildResultTable(removedResults, indexFeatures, "removed"),
    ...buildChangedResultTable(changedResults, indexFeatures),
  ];

  return content;
};

/**
 * Build the media wiki content for the differences in two cache archive files.
 * @param archiveDifferences Differences between two cache's archives
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
const buildArchiveDifferences = (
  archiveDifferences: ArchiveDifferences,
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const addedResults: Result[] = _.pluck(
    Object.values(archiveDifferences),
    "added"
  ).filter((entry) => entry !== null && entry !== undefined);

  const removedResults: Result[] = _.pluck(
    Object.values(archiveDifferences),
    "removed"
  ).filter((entry) => entry !== null && entry !== undefined);

  const changedResults: ChangedResult[] = _.pluck(
    Object.values(archiveDifferences),
    "changed"
  ).filter(
    (entry) =>
      entry !== null && entry !== undefined && Object.keys(entry).length > 0
  );

  const content: MediaWikiContent[] = [
    new MediaWikiHeader(indexFeatures.name, 2),
    new MediaWikiBreak(),
    ...buildResultTable(addedResults, indexFeatures, "added"),
    ...buildResultTable(removedResults, indexFeatures, "removed"),
    ...buildChangedResultTable(changedResults, indexFeatures),
  ];

  return content;
};

/**
 * Builds media wiki content for archive file differences.
 *  These tables include all changed fields.
 * @param archiveDifferences Differences between two cache's archives
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
const buildChangedResultTable = (
  changedResults: ChangedResult[],
  indexFeatures: IndexFeatures
) => {
  const differenceName = resultNameMap.changed;
  const content: MediaWikiContent[] = [];

  const rows: MediaWikiTableRow[] =
    changedResults?.length > 0
      ? changedResults
          .map<MediaWikiTableRow[]>((entry) => {
            const diffKeys = Object.keys(entry).filter((key) => {
              const isIdentifier = (
                indexFeatures.identifiers as string[]
              ).includes(key);
              return (
                !isIdentifier || entry[key].oldValue !== entry[key].newValue
              );
            });
            return diffKeys.length > 0
              ? [
                  {
                    cells: indexFeatures.identifiers.map<MediaWikiTableCell>(
                      (identifier) => ({
                        content: formatEntryIdentifier(
                          identifier,
                          entry[identifier].newValue,
                          indexFeatures.urls
                        ),
                        options: {
                          rowspan: diffKeys.length + 1,
                        },
                      })
                    ),
                  },
                  ...diffKeys.map<MediaWikiTableRow>((field) =>
                    getFieldDifferencesRow(entry, field)
                  ),
                ]
              : undefined;
          })
          .flat()
          .filter((value) => value !== undefined)
      : [];

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
          cells: [
            ...indexFeatures.identifiers.map((identifier) =>
              capitalize(identifier)
            ),
            "Key",
            "Previous Value",
            "New Value",
          ].map((column, index) => ({
            content: [new MediaWikiText(column)],
            options: index == 0 ? { style: "width: 15em" } : undefined,
          })),
        },
        ...rows,
      ],
      options: {
        class: "wikitable sortable sticky-header",
      },
    }),
    new MediaWikiBreak()
  );
  return content;
};

/**
 * Build media wiki content for archive file's additions or removals.
 *  These tables include specified fields from indexFeatures.
 * @param archiveDifferences Differences between two cache's archive files
 * @param indexFeatures Meta deta for indexes
 * @param type Definition for added or removed content
 * @returns
 */
const buildResultTable = (
  results: Result[],
  indexFeatures: IndexFeatures,
  type: Difference
): MediaWikiContent[] => {
  const differenceName = resultNameMap[type];
  const tableFields = indexFeatures.fields.map((field) => field.toString());
  const fields = [...indexFeatures.identifiers, ...tableFields];
  const content: MediaWikiContent[] = [];

  const rows: MediaWikiTableRow[] =
    results?.length > 0
      ? results.map((entry) => {
          const identifierCells = indexFeatures.identifiers.map(
            (identifier) => ({
              content: formatEntryIdentifier(
                identifier,
                entry[identifier],
                indexFeatures.urls
              ),
            })
          );
          return {
            cells: [
              ...identifierCells,
              ...tableFields.map((field) => ({
                content: [
                  new MediaWikiText(formatEntryValue(field, entry[field])),
                ],
              })),
            ],
            minimal: true,
          };
        })
      : [];

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
                colspan: fields.length,
              },
            },
          ],
        },
        {
          header: true,
          minimal: true,
          cells: fields.map((field, index) => ({
            content: [new MediaWikiText(field)],
            options: index == 0 ? { style: "width: 15em" } : undefined,
          })),
        },
        ...rows,
      ],
      options: {
        class: "wikitable sortable",
      },
    }),
    new MediaWikiBreak()
  );
  return content;
};

export default differencesBuilder;
