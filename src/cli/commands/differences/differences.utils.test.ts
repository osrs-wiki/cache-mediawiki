import { parseIndices } from "./differences.utils";

describe("parseIndices", () => {
  describe("valid inputs", () => {
    test("should parse comma-separated numeric string", () => {
      expect(parseIndices("2,5,8")).toEqual([2, 5, 8]);
    });

    test("should handle single number", () => {
      expect(parseIndices("42")).toEqual([42]);
    });

    test("should handle numbers with whitespace", () => {
      expect(parseIndices(" 1 , 2 , 3 ")).toEqual([1, 2, 3]);
    });

    test("should handle zero", () => {
      expect(parseIndices("0,1,2")).toEqual([0, 1, 2]);
    });

    test("should handle negative numbers", () => {
      expect(parseIndices("-1,2,-3")).toEqual([-1, 2, -3]);
    });
  });

  describe("mixed valid and invalid inputs", () => {
    test("should filter out NaN values and keep valid numbers", () => {
      expect(parseIndices("3,a,8,b")).toEqual([3, 8]);
    });

    test("should handle mix with whitespace", () => {
      expect(parseIndices(" 1 , abc , 2 , def ")).toEqual([1, 2]);
    });

    test("should handle numbers mixed with empty segments", () => {
      expect(parseIndices("1,,2,,3")).toEqual([1, 2, 3]);
    });

    test("should handle leading/trailing commas with valid numbers", () => {
      expect(parseIndices(",1,2,")).toEqual([1, 2]);
    });
  });

  describe("invalid inputs", () => {
    test("should return empty array for all invalid values", () => {
      expect(parseIndices("a,b,c")).toEqual([]);
    });

    test("should return empty array for special characters", () => {
      expect(parseIndices("@,#,$")).toEqual([]);
    });

    test("should return empty array for only commas", () => {
      expect(parseIndices(",,,")).toEqual([]);
    });

    test("should return empty array for only whitespace", () => {
      expect(parseIndices("   ")).toEqual([]);
    });
  });

  describe("edge cases", () => {
    test("should return undefined for undefined input", () => {
      expect(parseIndices(undefined)).toBeUndefined();
    });

    test("should return undefined for empty string", () => {
      expect(parseIndices("")).toBeUndefined();
    });

    test("should handle very large numbers", () => {
      expect(parseIndices("999999,1000000")).toEqual([999999, 1000000]);
    });

    test("should handle decimal numbers (parseInt behavior)", () => {
      // parseInt truncates decimal places
      expect(parseIndices("1.5,2.9")).toEqual([1, 2]);
    });

    test("should handle numbers with leading zeros", () => {
      expect(parseIndices("001,002,003")).toEqual([1, 2, 3]);
    });
  });

  describe("real-world scenarios", () => {
    test("should handle typical cache index IDs", () => {
      expect(parseIndices("2,3,5,8")).toEqual([2, 3, 5, 8]);
    });

    test("should handle user typos gracefully", () => {
      expect(parseIndices("2,3,typo,8")).toEqual([2, 3, 8]);
    });

    test("should handle copy-paste with extra spaces", () => {
      expect(parseIndices("  2  ,  3  ,  5  ")).toEqual([2, 3, 5]);
    });

    test("should handle single index with spaces", () => {
      expect(parseIndices("  42  ")).toEqual([42]);
    });
  });
});
