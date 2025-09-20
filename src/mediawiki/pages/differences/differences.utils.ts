import {
  MediaWikiContent,
  MediaWikiExternalLink,
  MediaWikiLink,
  type MediaWikiTableRow,
  MediaWikiText,
  MediaWikiBreak,
  MediaWikiHeader,
  MediaWikiTable,
  type MediaWikiTableCell,
} from "@osrs-wiki/mediawiki-builder";
import { diffWords } from "diff";
import _, { flatten } from "underscore";

import {
  IndexFeatures,
  IndexURLType,
  IndexURLs,
  resultNameMap,
} from "./differences.types";
import {
  ArchiveDifferences,
  ChangedResult,
  Difference,
  IndexDifferences,
  Result,
  ResultValue,
} from "../../../tasks/differences/differences.types";

import { jagexHSLtoHex } from "@/utils/colors";
import { capitalize, stripHtmlTags } from "@/utils/string";

/**
 * Format the value a field.
 * @param field The field of a {Result}
 * @param value The unformatted {ResultValue}
 * @returns A formatted string.
 */
export const formatEntryValue = (field: string, value: ResultValue): string => {
  if (
    value === undefined ||
    (value && typeof value === "object" && Object.keys(value).length === 0)
  ) {
    return "";
  }
  if (
    field.toLocaleLowerCase().includes("color") &&
    typeof value === "number"
  ) {
    const hex = jagexHSLtoHex(value);
    return `<span style = "background-color: ${hex};color:white">${value}</span>`;
  } else if (Array.isArray(value)) {
    /*if (field.toLocaleLowerCase().includes("color")) {
      return value.reduce(
        (result, color) =>
          result +
          " " +
          `<span style = "background-color: ${jagexHSLtoHex(
            color
          )};color:white">${color}</span>`,
        ""
      );
    }*/
    const mappedValues = value.map((value) =>
      value == null || value == undefined ? "None" : value
    );
    const stringValue =
      mappedValues.length > 0 ? JSON.stringify(mappedValues) : "";
    return stringValue
      .replaceAll('"None"', "None")
      .replaceAll('"', "")
      .replaceAll(",", ", ");
  } else if (typeof value === "string" || typeof value === "number") {
    return value.toString();
  }
  return JSON.stringify(value)
    .replaceAll('"', "'")
    .replaceAll(",", ", ")
    .replaceAll(":", ": ");
};

/**
 * Format a field's identifier.
 * @param identifier The field identifier key
 * @param value The Result value
 * @param urls Supported urls for names and identifiers
 * @returns
 */
export const formatEntryIdentifier = (
  identifier: string,
  value: ResultValue,
  urls: IndexURLs
): MediaWikiContent[] => {
  switch (identifier) {
    case "id":
      const urlKeys = Object.keys(urls);
      return urlKeys.length > 0
        ? urlKeys.map(
            (url, index) =>
              new MediaWikiExternalLink(
                index === 0 ? `${value}` : `(${index})`,
                `${urls[url as IndexURLType]}${value as string}`
              )
          )
        : [new MediaWikiText(formatEntryValue(identifier, value))];
    case "name":
      return [
        value
          ? new MediaWikiLink(stripHtmlTags(value as string))
          : new MediaWikiText(""),
      ];
    default:
      return [new MediaWikiText(formatEntryValue(identifier, value))];
  }
};

/**
 * Format entry field values and highlight any differences.
 * @param entry The field to check differences for
 * @param field
 * @returns A MediaWikiTableRow with formatted and highlighted columns.
 */
export const getFieldDifferencesRow = (
  entry: ChangedResult,
  field: string
): MediaWikiTableRow => {
  const oldValue = formatEntryValue(field, entry[field].oldValue);
  const newValue = formatEntryValue(field, entry[field].newValue);

  const differences = diffWords(oldValue, newValue);
  let oldValueDiffs = "";
  let newValueDiffs = "";
  differences.forEach((part) => {
    if (!part || !part.value) {
      return;
    }
    if (part.added) {
      newValueDiffs += `<span style="color: #6bc71f">${part.value}</span>`;
    } else if (part.removed) {
      oldValueDiffs += `<span style="color: #ee4231">${part.value}</span>`;
    } else {
      newValueDiffs += part.value;
      oldValueDiffs += part.value;
    }
  });
  return {
    cells: [
      {
        content: [new MediaWikiText(field)],
      },
      {
        content: [new MediaWikiText(oldValueDiffs)],
      },
      {
        content: [new MediaWikiText(newValueDiffs)],
      },
    ],
    minimal: true,
  };
};

/**
 * Build the media wiki content for the differences in two cache index's archives.
 * @param indexDifferences Differences between two cache's index's archives.
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
export const buildIndexDifferences = (
  indexDifferences: IndexDifferences,
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const fileDifferences = flatten(
    Object.values(indexDifferences).map((archive) =>
      Object.values(archive).flat()
    )
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

  return buildDiffSection(
    addedResults,
    removedResults,
    changedResults,
    indexFeatures
  );
};

/**
 * Build the media wiki content for the differences in two cache archive files.
 * @param archiveDifferences Differences between two cache's archives
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
export const buildArchiveDifferences = (
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

  return buildDiffSection(
    addedResults,
    removedResults,
    changedResults,
    indexFeatures
  );
};

/**
 * Builds a section of media wiki content for the differences between two cache files.
 *  This includes the added, removed, and changed results.
 * @param addedResults The added results from the differences
 * @param removedResults The removed results from the differences
 * @param changedResults The changed results from the differences
 * @param indexFeatures Meta data for indexes
 * @returns {MediaWikiContent[]}
 */
export const buildDiffSection = (
  addedResults: Result[],
  removedResults: Result[],
  changedResults: ChangedResult[],
  indexFeatures: IndexFeatures
): MediaWikiContent[] => {
  const content: MediaWikiContent[] = [
    new MediaWikiHeader(indexFeatures.name, 2),
    new MediaWikiBreak(),
  ];

  if (addedResults.length > 0) {
    content.push(...buildResultTable(addedResults, indexFeatures, "added"));
  }

  if (removedResults.length > 0) {
    content.push(...buildResultTable(removedResults, indexFeatures, "removed"));
  }

  if (changedResults.length > 0) {
    content.push(...buildChangedResultTable(changedResults, indexFeatures));
  }
  return content;
};

/**
 * Builds media wiki content for archive file differences.
 *  These tables include all changed fields.
 * @param archiveDifferences Differences between two cache's archives
 * @param indexFeatures Meta deta for indexes
 * @returns {MediaWikiContent[]}
 */
export const buildChangedResultTable = (
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
                    cells: indexFeatures.identifiers
                      .map<MediaWikiTableCell>((identifier) =>
                        entry[identifier]
                          ? {
                              content: formatEntryIdentifier(
                                identifier,
                                entry[identifier].newValue,
                                indexFeatures.urls
                              ),
                              options: {
                                rowspan: diffKeys.length + 1,
                              },
                            }
                          : undefined
                      )
                      .filter((value) => value !== undefined),
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
                colspan: 2 + indexFeatures.identifiers.length,
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
        class: `wikitable sortable sticky-header mw-collapsible${
          rows.length > 50 ? " mw-collapsed" : ""
        }`,
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
export const buildResultTable = (
  results: Result[],
  indexFeatures: IndexFeatures,
  type: Difference
): MediaWikiContent[] => {
  const differenceName = resultNameMap[type];
  const tableFields = indexFeatures.fields
    .map((field) => field.toString())
    .filter((field) => !!field);
  const fields = [...indexFeatures.identifiers, ...tableFields];
  const content: MediaWikiContent[] = [];

  const rows: MediaWikiTableRow[] =
    results?.length > 0
      ? results.map((entry) => {
          const identifierCells = indexFeatures.identifiers
            .filter((identifier) => !!identifier)
            .map((identifier) => ({
              content: formatEntryIdentifier(
                identifier,
                entry[identifier],
                indexFeatures.urls
              ),
            }));
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
          cells: fields
            .filter((field) => !!field)
            .map((field, index) => ({
              content: [new MediaWikiText(field)],
              options: index == 0 ? { style: "width: 15em" } : undefined,
            })),
        },
        ...rows,
      ],
      options: {
        class: `wikitable sortable sticky-header mw-collapsible${
          rows.length > 50 ? " mw-collapsed" : ""
        }`,
      },
    }),
    new MediaWikiBreak()
  );
  return content;
};
