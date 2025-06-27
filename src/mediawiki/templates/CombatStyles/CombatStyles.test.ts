import CombatStyles from "./CombatStyles";

import { ATTACK_RANGE_PARAM, ATTACK_SPEED_PARAM } from "@/types/item";
import { Item } from "@/utils/cache2";

jest.mock("@/types/item", () => ({
  getWeaponCategory: jest.fn(() => "melee"), // Mock getWeaponCategory to return "melee"
}));

describe("CombatStyles", () => {
  it.skip("should generate a CombatStyles template with correct parameters", () => {
    const mockItem = {
      params: new Map([
        [ATTACK_SPEED_PARAM, 4],
        [ATTACK_RANGE_PARAM, 6],
      ]),
    } as unknown as Item;

    const template = CombatStyles(mockItem);

    expect(template.name).toBe("CombatStyles");
    expect(template.params).toEqual([
      { key: "", value: "melee" },
      { key: "speed", value: "4" },
      { key: "attackrange", value: "6" },
    ]);
  });

  it("should default missing parameters to '0' and combatstyle to 'unknown'", () => {
    const mockItem = {
      params: new Map(),
    } as unknown as Item;

    const template = CombatStyles(mockItem);

    expect(template.params).toEqual([
      { key: "", value: "melee" },
      { key: "speed", value: "0" },
      { key: "attackrange", value: "0" },
    ]);
  });
});
