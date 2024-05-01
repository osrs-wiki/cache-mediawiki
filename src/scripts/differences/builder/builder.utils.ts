import {
  MediaWikiContent,
  MediaWikiExternalLink,
  MediaWikiLink,
  type MediaWikiTableRow,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import { diffWords } from "diff";

import { IndexURLType, IndexURLs } from "./builder.types";
import { jagexHSLtoHex } from "../../../utils/colors";
import { ChangedResult, ResultValue } from "../differences.types";

/**
 * Format the value a field.
 * @param field The field of a {Result}
 * @param value The unformatted {ResultValue}
 * @returns A formatted string.
 */
export const formatEntryValue = (field: string, value: ResultValue): string => {
  if (
    !value ||
    (typeof value === "object" && Object.keys(value).length === 0)
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
      return Object.keys(urls).map(
        (url, index) =>
          new MediaWikiExternalLink(
            index === 0 ? (value as string) : `(${index})`,
            `${urls[url as IndexURLType]}${value as string}`
          )
      );
    case "name":
      return [new MediaWikiLink(value as string)];
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
