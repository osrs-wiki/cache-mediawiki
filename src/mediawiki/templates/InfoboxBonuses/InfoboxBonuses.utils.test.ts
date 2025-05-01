import { formatBonus } from "./InfoboxBonuses.utils";

describe("formatBonus", () => {
  it("should format positive numbers with a '+' prefix", () => {
    expect(formatBonus(10)).toBe("+10");
    expect(formatBonus("25")).toBe("+25");
  });

  it("should format negative numbers with a '-' prefix", () => {
    expect(formatBonus(-5)).toBe("-5");
    expect(formatBonus("-15")).toBe("-15");
  });

  it("should return '0' for zero values", () => {
    expect(formatBonus(0)).toBe("0");
    expect(formatBonus("0")).toBe("0");
  });

  it("should handle invalid string inputs gracefully", () => {
    expect(formatBonus("abc")).toBe("0");
    expect(formatBonus("")).toBe("0");
  });
});
