import {
  MediaWikiText,
  type MediaWikiTableCell,
} from "@osrs-wiki/mediawiki-builder";

import { ChangedResult, ResultValue } from "../differences.types";

export const formatEntryValue = (value: ResultValue): string => {
  if (Array.isArray(value)) {
    const filteredValues = value.filter(
      (value) => value !== null && value !== undefined
    );
    return filteredValues.join(", ");
  }
  return JSON.stringify(value);
};
