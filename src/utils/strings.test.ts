import { capitalize } from "./strings";

describe("capitalize", () => {
  it("should capitalize the first letter of a string", () => {
    expect(capitalize("test")).toBe("Test");
    expect(capitalize("UPPERCASE")).toBe("UPPERCASE");
    expect(capitalize("")).toBe("");
    expect(capitalize("a")).toBe("A");
  });
});