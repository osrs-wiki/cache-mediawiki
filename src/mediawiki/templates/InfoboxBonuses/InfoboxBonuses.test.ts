import InfoboxBonuses from "./InfoboxBonuses";

import {
  ATTACK_RANGE_PARAM,
  ATTACK_SPEED_PARAM,
  CRUSH_ATTACK_PARAM,
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DAMAGE_PARAM,
  MAGIC_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  PRAYER_BONUS_PARAM,
  RANGED_AMMO_STRENGTH_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  RANGED_EQUIPMENT_STRENGTH_PARAM,
  SLASH_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
} from "@/types/params";
import { Item, ItemID, Params, WearPos } from "@/utils/cache2";

const BASE_EQUIPABLE_ITEM: Item = {
  name: "Test Equipment",
  isMembers: true,
  isGrandExchangable: true,
  id: 1234 as ItemID,
  inventoryModel: undefined,
  examine: "Test equipment.",
  zoom2d: 0,
  xan2d: 0,
  yan2d: 0,
  offsetX2d: 0,
  offsetY2d: 0,
  isStackable: false,
  price: 0,
  wearpos1: WearPos.Weapon,
  wearpos2: undefined,
  wearpos3: undefined,
  weight: 0,
  maleModel: undefined,
  maleOffset: 0,
  maleModel1: undefined,
  femaleModel: undefined,
  femaleOffset: 0,
  femaleModel1: undefined,
  groundActions: [],
  inventoryActions: ["Wield"],
  subops: [],
  recolorFrom: [],
  recolorTo: [],
  retextureFrom: [],
  retextureTo: [],
  shiftClickIndex: 0,
  maleModel2: undefined,
  femaleModel2: undefined,
  maleChatheadModel: undefined,
  femaleChatheadModel: undefined,
  maleChatheadModel2: undefined,
  femaleChatheadModel2: undefined,
  category: undefined,
  zan2d: 0,
  noteLinkedItem: undefined,
  noteTemplate: undefined,
  stackVariantItems: [],
  stackVariantQuantities: [],
  resizeX: 0,
  resizeY: 0,
  resizeZ: 0,
  ambient: 0,
  contrast: 0,
  team: 0,
  noted2: undefined,
  noted3: undefined,
  placeholderLinkedItem: undefined,
  placeholderTemplate: undefined,
  params: new Params(),
};

describe("InfoboxBonuses", () => {
  test("single item with basic bonuses", () => {
    const params = new Params();
    params.set(STAB_ATTACK_PARAM, 10);
    params.set(SLASH_DEFENCE_PARAM, 5);
    params.set(MELEE_STRENGTH_PARAM, 8);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Bronze sword",
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single item with all combat bonuses", () => {
    const params = new Params();
    params.set(STAB_ATTACK_PARAM, 15);
    params.set(SLASH_ATTACK_PARAM, 20);
    params.set(CRUSH_ATTACK_PARAM, 10);
    params.set(MAGIC_ATTACK_PARAM, 5);
    params.set(RANGED_ATTACK_PARAM, 0);
    params.set(STAB_DEFENCE_PARAM, 12);
    params.set(SLASH_DEFENCE_PARAM, 14);
    params.set(CRUSH_DEFENCE_PARAM, 11);
    params.set(MAGIC_DEFENCE_PARAM, 8);
    params.set(RANGED_DEFENCE_PARAM, 9);
    params.set(MELEE_STRENGTH_PARAM, 18);
    params.set(PRAYER_BONUS_PARAM, 3);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Full helm",
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single weapon with attack speed and range", () => {
    const params = new Params();
    params.set(STAB_ATTACK_PARAM, 25);
    params.set(MELEE_STRENGTH_PARAM, 30);
    params.set(ATTACK_SPEED_PARAM, 4);
    params.set(ATTACK_RANGE_PARAM, 1);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Dragon dagger",
      wearpos1: WearPos.Weapon,
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single item with magic damage bonus", () => {
    const params = new Params();
    params.set(MAGIC_ATTACK_PARAM, 15);
    params.set(MAGIC_DAMAGE_PARAM, 20); // 20/10 = 2%
    params.set(MAGIC_DEFENCE_PARAM, 10);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Magic staff",
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single item with ranged strength (ammo)", () => {
    const params = new Params();
    params.set(RANGED_ATTACK_PARAM, 10);
    params.set(RANGED_AMMO_STRENGTH_PARAM, 15);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Bronze arrows",
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single item with ranged strength (equipment)", () => {
    const params = new Params();
    params.set(RANGED_ATTACK_PARAM, 20);
    params.set(RANGED_EQUIPMENT_STRENGTH_PARAM, 25);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Shortbow",
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single ammo item (no equipped images)", () => {
    const params = new Params();
    params.set(RANGED_ATTACK_PARAM, 10);
    params.set(RANGED_AMMO_STRENGTH_PARAM, 15);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Bronze arrows",
      wearpos1: WearPos.Ammo,
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("single ring item (no equipped images)", () => {
    const params = new Params();
    params.set(MAGIC_ATTACK_PARAM, 5);
    params.set(PRAYER_BONUS_PARAM, 2);

    const item: Item = {
      ...BASE_EQUIPABLE_ITEM,
      name: "Ring of life",
      wearpos1: WearPos.Ring,
      params,
    };

    const result = InfoboxBonuses(item);
    expect(result.build()).toMatchSnapshot();
  });

  test("multiple items with versioned equipped images", () => {
    const params1 = new Params();
    params1.set(STAB_ATTACK_PARAM, 10);
    params1.set(MELEE_STRENGTH_PARAM, 12);

    const params2 = new Params();
    params2.set(STAB_ATTACK_PARAM, 10);
    params2.set(MELEE_STRENGTH_PARAM, 12);

    const params3 = new Params();
    params3.set(STAB_ATTACK_PARAM, 10);
    params3.set(MELEE_STRENGTH_PARAM, 12);

    const items: Item[] = [
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Test Sword",
        id: 1000 as ItemID,
        params: params1,
      },
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Test Sword (2)",
        id: 1001 as ItemID,
        params: params2,
      },
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Test Sword (3)",
        id: 1002 as ItemID,
        params: params3,
      },
    ];

    const result = InfoboxBonuses(items);
    expect(result.build()).toMatchSnapshot();
  });

  test("multiple items with parenthetical suffix", () => {
    const params = new Params();
    params.set(CRUSH_ATTACK_PARAM, 15);
    params.set(MELEE_STRENGTH_PARAM, 18);

    const items: Item[] = [
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Crate of adamantite ore",
        id: 32435 as ItemID,
        params,
      },
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Crate of adamantite ore (2)",
        id: 32436 as ItemID,
        params,
      },
    ];

    const result = InfoboxBonuses(items);
    expect(result.build()).toMatchSnapshot();
  });

  test("multiple ammo items (no equipped images)", () => {
    const params1 = new Params();
    params1.set(RANGED_ATTACK_PARAM, 10);
    params1.set(RANGED_AMMO_STRENGTH_PARAM, 15);

    const params2 = new Params();
    params2.set(RANGED_ATTACK_PARAM, 10);
    params2.set(RANGED_AMMO_STRENGTH_PARAM, 15);

    const items: Item[] = [
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Bronze arrows",
        id: 882 as ItemID,
        wearpos1: WearPos.Ammo,
        params: params1,
      },
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Bronze arrows (2)",
        id: 883 as ItemID,
        wearpos1: WearPos.Ammo,
        params: params2,
      },
    ];

    const result = InfoboxBonuses(items);
    expect(result.build()).toMatchSnapshot();
  });

  test("multiple items with negative bonuses", () => {
    const params1 = new Params();
    params1.set(STAB_ATTACK_PARAM, -5);
    params1.set(SLASH_ATTACK_PARAM, -3);
    params1.set(MAGIC_DEFENCE_PARAM, -10);

    const params2 = new Params();
    params2.set(STAB_ATTACK_PARAM, -5);
    params2.set(SLASH_ATTACK_PARAM, -3);
    params2.set(MAGIC_DEFENCE_PARAM, -10);

    const items: Item[] = [
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Decorative platebody",
        id: 1234 as ItemID,
        params: params1,
      },
      {
        ...BASE_EQUIPABLE_ITEM,
        name: "Decorative platebody (2)",
        id: 1235 as ItemID,
        params: params2,
      },
    ];

    const result = InfoboxBonuses(items);
    expect(result.build()).toMatchSnapshot();
  });
});
