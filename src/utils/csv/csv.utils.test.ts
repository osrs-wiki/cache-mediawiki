import {
  escapeCsvValue,
  arrayToString,
  objectToString,
  flattenObject,
  formatValue,
} from "./csv.utils";

describe("csv.utils", () => {
  describe("escapeCsvValue", () => {
    test("should escape values with quotes", () => {
      expect(escapeCsvValue('test "quoted" value')).toBe(
        '"test ""quoted"" value"'
      );
    });

    test("should wrap values with commas in quotes", () => {
      expect(escapeCsvValue("test, value")).toBe('"test, value"');
    });

    test("should wrap values with newlines in quotes", () => {
      expect(escapeCsvValue("test\nvalue")).toBe('"test\nvalue"');
    });

    test("should return plain values unchanged", () => {
      expect(escapeCsvValue("simple value")).toBe("simple value");
    });

    test("should handle null and undefined", () => {
      expect(escapeCsvValue(null)).toBe("");
      expect(escapeCsvValue(undefined)).toBe("");
    });
  });

  describe("arrayToString", () => {
    test("should convert array to semicolon-separated string", () => {
      expect(arrayToString(["a", "b", "c"])).toBe("a; b; c");
    });

    test("should handle array with objects", () => {
      expect(arrayToString(["a", { id: 1 }, "c"])).toBe('a; {"id":1}; c');
    });

    test("should handle non-array input", () => {
      expect(arrayToString("not an array" as unknown as unknown[])).toBe(
        "not an array"
      );
    });
  });

  describe("objectToString", () => {
    test("should convert object to JSON string", () => {
      expect(objectToString({ id: 1, name: "test" })).toBe(
        '{"id":1,"name":"test"}'
      );
    });

    test("should handle arrays", () => {
      expect(objectToString([1, 2, 3])).toBe("1; 2; 3");
    });

    test("should handle null and undefined", () => {
      expect(objectToString(null)).toBe("");
      expect(objectToString(undefined)).toBe("");
    });

    test("should handle primitive types", () => {
      expect(objectToString("string")).toBe("string");
      expect(objectToString(123)).toBe("123");
    });
  });

  describe("flattenObject", () => {
    test("should flatten nested object", () => {
      const input = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3,
          },
        },
      };

      const result = flattenObject(input);
      expect(result).toEqual({
        "a": 1,
        "b.c": 2,
        "b.d.e": 3,
      });
    });

    test("should handle arrays as leaf values", () => {
      const input = {
        a: [1, 2, 3],
        b: {
          c: ["x", "y"],
        },
      };

      const result = flattenObject(input);
      expect(result).toEqual({
        "a": [1, 2, 3],
        "b.c": ["x", "y"],
      });
    });
  });

  describe("formatValue", () => {
    test("should format different value types", () => {
      expect(formatValue(null)).toBe("");
      expect(formatValue(undefined)).toBe("");
      expect(formatValue(true)).toBe("true");
      expect(formatValue(42)).toBe("42");
      expect(formatValue("string")).toBe("string");
      expect(formatValue([1, 2, 3])).toBe("1; 2; 3");
      expect(formatValue({ id: 1 })).toBe('{"id":1}');
    });
  });
});
