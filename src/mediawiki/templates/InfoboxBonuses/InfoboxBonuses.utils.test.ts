import {
  formatBonus,
  generateEquippedImageParams,
} from "./InfoboxBonuses.utils";

import { Item, ItemID, Params, WearPos } from "@/utils/cache2";

const BASE_ITEM: Item = {
  name: "Test Item",
  isMembers: true,
  isGrandExchangable: true,
  id: 1234 as ItemID,
  inventoryModel: undefined,
  examine: "Test item.",
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
  inventoryActions: [],
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

describe("generateEquippedImageParams", () => {
  it("should generate single image/altimage for single item", () => {
    const item: Item = {
      ...BASE_ITEM,
      name: "Bronze sword",
      wearpos1: WearPos.Weapon,
    };

    const result = generateEquippedImageParams(item);

    expect(result.image).toBeDefined();
    expect(result.altimage).toBeDefined();
    expect(result.image1).toBeUndefined();
    expect(result.altimage1).toBeUndefined();
    expect(result.image?.build()).toBe(
      "[[File:Bronze sword equipped male.png]]"
    );
    expect(result.altimage?.build()).toBe(
      "[[File:Bronze sword equipped female.png]]"
    );
  });

  it("should generate versioned images for multiple items", () => {
    const items: Item[] = [
      {
        ...BASE_ITEM,
        name: "Test Sword",
        id: 1000 as ItemID,
        wearpos1: WearPos.Weapon,
      },
      {
        ...BASE_ITEM,
        name: "Test Sword (2)",
        id: 1001 as ItemID,
        wearpos1: WearPos.Weapon,
      },
      {
        ...BASE_ITEM,
        name: "Test Sword (3)",
        id: 1002 as ItemID,
        wearpos1: WearPos.Weapon,
      },
    ];

    const result = generateEquippedImageParams(items);

    expect(result.image).toBeUndefined();
    expect(result.altimage).toBeUndefined();
    expect(result.image1).toBeDefined();
    expect(result.image2).toBeDefined();
    expect(result.image3).toBeDefined();
    expect(result.altimage1).toBeDefined();
    expect(result.altimage2).toBeDefined();
    expect(result.altimage3).toBeDefined();
    expect(result.image1?.build()).toBe(
      "[[File:Test Sword equipped male.png]]"
    );
    expect(result.image2?.build()).toBe(
      "[[File:Test Sword (2) equipped male.png]]"
    );
    expect(result.image3?.build()).toBe(
      "[[File:Test Sword (3) equipped male.png]]"
    );
    expect(result.altimage1?.build()).toBe(
      "[[File:Test Sword equipped female.png]]"
    );
    expect(result.altimage2?.build()).toBe(
      "[[File:Test Sword (2) equipped female.png]]"
    );
    expect(result.altimage3?.build()).toBe(
      "[[File:Test Sword (3) equipped female.png]]"
    );
  });

  it("should strip parenthetical suffix from base name", () => {
    const items: Item[] = [
      {
        ...BASE_ITEM,
        name: "Crate of adamantite ore",
        id: 32435 as ItemID,
        wearpos1: WearPos.Weapon,
      },
      {
        ...BASE_ITEM,
        name: "Crate of adamantite ore (2)",
        id: 32436 as ItemID,
        wearpos1: WearPos.Weapon,
      },
    ];

    const result = generateEquippedImageParams(items);

    expect(result.image1?.build()).toBe(
      "[[File:Crate of adamantite ore equipped male.png]]"
    );
    expect(result.image2?.build()).toBe(
      "[[File:Crate of adamantite ore (2) equipped male.png]]"
    );
  });

  it("should not generate images for ammo slot", () => {
    const item: Item = {
      ...BASE_ITEM,
      name: "Bronze arrows",
      wearpos1: WearPos.Ammo,
    };

    const result = generateEquippedImageParams(item);

    expect(Object.keys(result).length).toBe(0);
  });

  it("should not generate images for ring slot", () => {
    const item: Item = {
      ...BASE_ITEM,
      name: "Ring of life",
      wearpos1: WearPos.Ring,
    };

    const result = generateEquippedImageParams(item);

    expect(Object.keys(result).length).toBe(0);
  });

  it("should not generate images for multiple ammo items", () => {
    const items: Item[] = [
      {
        ...BASE_ITEM,
        name: "Bronze arrows",
        id: 882 as ItemID,
        wearpos1: WearPos.Ammo,
      },
      {
        ...BASE_ITEM,
        name: "Bronze arrows (2)",
        id: 883 as ItemID,
        wearpos1: WearPos.Ammo,
      },
    ];

    const result = generateEquippedImageParams(items);

    expect(Object.keys(result).length).toBe(0);
  });
});
