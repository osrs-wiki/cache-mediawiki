import {
  MediaWikiContent,
  MediaWikiExternalLink,
  MediaWikiLink,
} from "@osrs-wiki/mediawiki-builder";

import { IndexURLType, IndexURLs } from "./builder.types";
import { HSL } from "../../../utils/cache2";
import { jagexHSLtoHex } from "../../../utils/colors";
import { ResultValue } from "../differences.types";

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
  }
};
