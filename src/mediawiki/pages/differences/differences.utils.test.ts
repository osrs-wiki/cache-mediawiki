import {
  MediaWikiExternalLink,
  MediaWikiText,
  MediaWikiLink,
} from "@osrs-wiki/mediawiki-builder";

import { URLGeneratorFunction } from "./differences.types";
import {
  getFieldDifferencesRow,
  formatEntryValue,
  formatEntryIdentifier,
} from "./differences.utils";

import { jagexHSLtoHex } from "@/utils/colors";
import { regionToWorldMapURL } from "@/utils/url-generation";

// Mock the jagexHSLtoHex function
jest.mock("@/utils/colors", () => ({
  jagexHSLtoHex: jest.fn((color) => `#mock-${color}`),
}));

describe("differences builder utils", () => {
  describe("getFieldDifferencesRow", () => {
    test("one difference", () => {
      expect(
        getFieldDifferencesRow(
          { test: { oldValue: "test removed", newValue: "test added" } },
          "test"
        )
      ).toMatchSnapshot();
    });

    test("multiple difference", () => {
      expect(
        getFieldDifferencesRow(
          {
            test: {
              oldValue: "test removed first",
              newValue: "test added second",
            },
          },
          "test"
        )
      ).toMatchSnapshot();
    });
  });

  describe("formatEntryValue", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("should return empty string for undefined values", () => {
      expect(formatEntryValue("someField", undefined)).toBe("");
    });

    test("should return empty string for empty objects", () => {
      expect(formatEntryValue("someField", {})).toBe("");
    });

    test("should format color fields with HTML span", () => {
      const colorValue = 12345;
      const result = formatEntryValue("color", colorValue);

      expect(jagexHSLtoHex).toHaveBeenCalledWith(colorValue);
      expect(result).toBe(
        `<span style = "background-color: #mock-${colorValue};color:white">${colorValue}</span>`
      );
    });

    test("should format color fields with HTML span when field has 'color' in name", () => {
      const colorValue = 54321;
      const result = formatEntryValue("textColor", colorValue);

      expect(jagexHSLtoHex).toHaveBeenCalledWith(colorValue);
      expect(result).toBe(
        `<span style = "background-color: #mock-${colorValue};color:white">${colorValue}</span>`
      );
    });

    test("should format arrays by converting to comma-separated string", () => {
      const arrayValue = [1, 2, 3];
      expect(formatEntryValue("items", arrayValue)).toBe("[1, 2, 3]");
    });

    test("should replace null/undefined values in arrays with 'None'", () => {
      const arrayWithNulls = [1, null, 3, undefined];
      expect(formatEntryValue("items", arrayWithNulls)).toBe(
        "[1, None, 3, None]"
      );
    });

    test("should return empty string for empty arrays", () => {
      expect(formatEntryValue("emptyArray", [])).toBe("");
    });

    test("should return value as string for string values", () => {
      expect(formatEntryValue("name", "Test String")).toBe("Test String");
    });

    test("should return value as string for numeric values", () => {
      expect(formatEntryValue("count", 42)).toBe("42");
    });

    test("should format objects by converting to string with custom formatting", () => {
      const objectValue = { key1: "value1", key2: 2 };
      expect(formatEntryValue("config", objectValue)).toBe(
        "{'key1': 'value1', 'key2': 2}"
      );
    });

    test("should handle complex nested objects", () => {
      const complexObject = { a: { b: 1 }, c: [2, 3] };
      expect(formatEntryValue("complex", complexObject)).toBe(
        "{'a': {'b': 1}, 'c': [2, 3]}"
      );
    });
  });

  describe("formatEntryIdentifier", () => {
    test("should strip HTML tags from name identifiers", () => {
      const result = formatEntryIdentifier(
        "name",
        "<col=00ffff>Tornado</col>",
        {}
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiLink);
      // The function should create a MediaWikiLink with stripped tags
      const built = result[0].build();
      expect(built).toContain("Tornado");
      expect(built).not.toContain("<col=");
      expect(built).not.toContain("</col>");
    });

    test("should handle empty name values", () => {
      const result = formatEntryIdentifier("name", "", {});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiText);
    });

    test("should handle null name values", () => {
      const result = formatEntryIdentifier("name", null, {});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiText);
    });

    test("should handle field-specific URL format with templates", () => {
      const fieldSpecificURLs = {
        id: {
          chisel:
            "https://chisel.weirdgloop.org/moid/npc_id.html#{id}" as const,
          abex: "https://abextm.github.io/cache2/#/viewer/npc/{id}" as const,
        },
      };

      const result = formatEntryIdentifier("id", 123, fieldSpecificURLs);
      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(MediaWikiExternalLink);
      expect(result[1]).toBeInstanceOf(MediaWikiExternalLink);

      // Verify URLs are generated correctly by building the content
      const firstBuilt = result[0].build();
      const secondBuilt = result[1].build();
      expect(firstBuilt).toContain(
        "https://chisel.weirdgloop.org/moid/npc_id.html#123"
      );
      expect(secondBuilt).toContain(
        "https://abextm.github.io/cache2/#/viewer/npc/123"
      );
    });

    test("should handle function-based URLs", () => {
      const functionURLs = {
        id: {
          world: regionToWorldMapURL,
        },
      };

      const regionId = (50 << 8) | 30;
      const result = formatEntryIdentifier("id", regionId, functionURLs);
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiExternalLink);

      const built = result[0].build();
      expect(built).toContain("osrs.world");
      expect(built).toContain("cx=3200"); // 50 << 6
      expect(built).toContain("cz=1920"); // 30 << 6
    });

    test("should fall back to text for fields without URLs", () => {
      const fieldSpecificURLs = {
        id: { chisel: "https://example.com/{id}" as const },
      };

      const result = formatEntryIdentifier(
        "unsupported",
        "value",
        fieldSpecificURLs
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiText);
    });

    test("should handle empty URL configuration", () => {
      const result = formatEntryIdentifier("id", 123, {});
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiText);
    });

    test("should pass context to URL generation", () => {
      const mockFunction = jest.fn().mockReturnValue("https://test.com");
      const functionURLs = {
        id: {
          world: mockFunction as unknown as typeof regionToWorldMapURL,
        },
      };

      const allFields = { name: "Test Item", id: 123 };
      const result = formatEntryIdentifier(
        "id",
        123,
        functionURLs,
        allFields,
        "npc"
      );

      expect(mockFunction).toHaveBeenCalledWith(123, {
        fieldName: "id",
        entityType: "npc",
        allFields,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiExternalLink);
    });

    test("should handle URL generation errors gracefully", () => {
      const errorFunction = jest.fn().mockImplementation(() => {
        throw new Error("URL generation failed");
      });

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const functionURLs = {
        id: {
          world: errorFunction as unknown as typeof regionToWorldMapURL,
        },
      };

      const result = formatEntryIdentifier("id", 123, functionURLs);

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(MediaWikiText);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to generate URL for id:world",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    test("should create external links with correct content", () => {
      const fieldSpecificURLs = {
        id: {
          chisel: "https://first.com/{id}" as const,
          abex: "https://second.com/{id}" as const,
        },
      };

      const result = formatEntryIdentifier("id", 456, fieldSpecificURLs);
      expect(result).toHaveLength(2);

      // Check that the links are built correctly
      const firstBuilt = result[0].build();
      const secondBuilt = result[1].build();

      expect(firstBuilt).toContain("[https://first.com/456 456]");
      expect(secondBuilt).toContain("[https://second.com/456 (1)]");
    });
  });
});
