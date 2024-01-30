import { getJsonDifference, getStringDifference } from "../difference.utils";

describe("difference.utils", () => {
  test("getStringDifference", () => {
    expect(getStringDifference("abc def 123", "abc 123")).toBe("def ");
  });

  test("getJsonDifference added", () => {
    expect(
      getJsonDifference(
        { "1": "2", "3": "4", "5": "6" },
        { "1": "2", "3": "5", "7": "8" }
      )
    ).toEqual({ "3": "5", "7": "8" });
  });

  test("getJsonDifference removed", () => {
    expect(
      getJsonDifference(
        { "1": "2", "3": "5", "7": "8" },
        { "1": "2", "3": "4", "5": "6" }
      )
    ).toEqual({ "3": "4", "5": "6" });
  });

  test("getJsonDifference deep", () => {
    expect(
      getJsonDifference(
        { "1": "2", "3": "5", "7": "8", "array": [1, 2, 3, 4] },
        { "1": "2", "3": "4", "5": "6", "array": [1, 2, 3] }
      )
    ).toEqual({ "3": "4", "5": "6", "array": [1, 2, 3] });
  });
});
