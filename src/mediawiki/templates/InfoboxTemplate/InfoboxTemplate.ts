import {
  MediaWikiTemplate,
  MediaWikiContent,
} from "@osrs-wiki/mediawiki-builder";

import { Template } from "./InfoboxTemplate.types";

import { capitalize } from "@/utils/strings";

export class InfoboxTemplate<T> extends Template {
  params: T | T[];

  constructor(name: string, params: T | T[]) {
    super(`Infobox ${capitalize(name)}`);
    this.params = params;
  }

  build() {
    const infoboxTemplate = new MediaWikiTemplate(this.name);

    if (Array.isArray(this.params)) {
      this.buildMultipleParams(infoboxTemplate, this.params);
    } else {
      this.buildSingleParams(infoboxTemplate, this.params);
    }

    return infoboxTemplate;
  }

  private buildSingleParams(template: MediaWikiTemplate, params: T) {
    Object.keys(params).forEach((key) => {
      const value = params[key as keyof T];
      if (value !== undefined) {
        const parsedValue = this.parseValue(value);
        template.add(key, parsedValue);
      }
    });
  }

  private buildMultipleParams(template: MediaWikiTemplate, paramsArray: T[]) {
    if (paramsArray.length === 0) return;

    // Add version parameters first
    paramsArray.forEach((_, index) => {
      template.add(`version${index + 1}`, (index + 1).toString());
    });

    // Get all unique keys across all param sets
    const allKeys = new Set<string>();
    paramsArray.forEach((params) => {
      Object.keys(params).forEach((key) => allKeys.add(key));
    });

    // For each key, determine if values are shared or different
    allKeys.forEach((key) => {
      const values = paramsArray.map((params) => {
        const value = params[key as keyof T];
        return value !== undefined ? this.parseValue(value) : undefined;
      });

      // Filter out undefined values for comparison
      const definedValues = values.filter((v) => v !== undefined);

      if (definedValues.length === 0) return;

      // Check if all defined values are the same
      const firstValue = definedValues[0];
      const allSame = definedValues.every((v) => v === firstValue);

      if (allSame) {
        // All defined values are the same - use shared parameter
        template.add(key, firstValue as string);
      } else {
        // Values differ - use numbered parameters
        values.forEach((value, index) => {
          if (value !== undefined) {
            template.add(`${key}${index + 1}`, value);
          }
        });
      }
    });
  }

  private parseValue(value: unknown): string {
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    } else if (value instanceof MediaWikiContent) {
      return value.build();
    } else if (Array.isArray(value)) {
      const filteredValues = value.filter((v) => v !== undefined && v !== null);
      if (
        filteredValues.every(
          (v) => typeof v === "string" || typeof v === "number"
        )
      ) {
        return filteredValues.join(", ");
      } else {
        return filteredValues
          .map((v) => (v instanceof MediaWikiContent ? v.build() : `${v}`))
          .join(" ");
      }
    } else if (value !== undefined && value !== null) {
      return `${value}`;
    }
    return "";
  }
}
