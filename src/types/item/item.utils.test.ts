import { getEquipmentSlot, getWeaponCategory } from "./item.utils";

import { CategoryID, WearPos } from "@/utils/cache2";

describe("item utils", () => {
  test("getWeaponCategory", () => {
    expect(
      getWeaponCategory({
        category: 150 as CategoryID,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toBe("Whip");
  });

  test("getEquipmentSlot for weapon and shield slot", () => {
    expect(
      getEquipmentSlot({
        wearpos1: WearPos.Weapon,
        wearpos2: WearPos.Shield,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toBe("2h");
  });

  test("getEquipmentSlot for weapon slot", () => {
    expect(
      getEquipmentSlot({
        wearpos1: WearPos.Torso,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toBe("body");
  });
});
