import { jagexHSLtoHex } from "../../../../utils/colors";
import { getFieldDifferencesRow, formatEntryValue } from "../builder.utils";

// Mock the jagexHSLtoHex function
jest.mock("../../../../utils/colors", () => ({
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
});
