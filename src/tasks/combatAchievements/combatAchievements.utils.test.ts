import { formatMonsterName } from "./combatAchievements.utils";

describe("combatAchievements utils", () => {
  test("formatMonsterName with comma", () => {
    expect(formatMonsterName("Whisperer, The")).toEqual("The Whisperer");
  });
  test("formatMonsterName with no spaces", () => {
    expect(formatMonsterName("Vorkath")).toEqual("Vorkath");
  });
  test("formatMonsterName with spaces", () => {
    expect(formatMonsterName("DK: Rex")).toEqual("DK: Rex");
  });
});
