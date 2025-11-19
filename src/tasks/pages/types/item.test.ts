import {
  getItemNameMap,
  clearItemNameMap,
  writeItemPage,
  flushItemPages,
} from "./item";

import { Item, ItemID } from "@/utils/cache2";

// Mock dependencies
jest.mock("../../renders", () => ({
  renderItems: jest.fn(),
}));

jest.mock("../pages.utils", () => ({
  writePageToFile: jest.fn(),
}));

jest.mock("@/mediawiki/pages/item", () => ({
  itemPageBuilder: jest.fn(() => ({ build: () => "mock page content" })),
}));

const createMockItem = (id: number, name: string): Item => {
  return {
    id: id as ItemID,
    name,
    examine: "Test item",
    isMembers: true,
    isGrandExchangable: true,
    inventoryModel: undefined,
    zoom2d: 0,
    xan2d: 0,
    yan2d: 0,
    offsetX2d: 0,
    offsetY2d: 0,
    isStackable: false,
    price: 1,
    wearpos1: -1,
    wearpos2: -1,
    wearpos3: -1,
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
    shiftClickIndex: -2,
    maleModel2: undefined,
    femaleModel2: undefined,
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
    params: new Map(),
    category: -1,
  } as Item;
};

describe("item page combining", () => {
  beforeEach(() => {
    clearItemNameMap();
    jest.clearAllMocks();
  });

  test("items with same base name are grouped together", async () => {
    const item1 = createMockItem(1, "Bronze sword");
    const item2 = createMockItem(2, "Bronze sword (two)");
    const item3 = createMockItem(3, "Bronze sword (three)");

    await writeItemPage(item1);
    await writeItemPage(item2);
    await writeItemPage(item3);

    const nameMap = getItemNameMap();
    expect(nameMap.has("Bronze sword")).toBe(true);
    expect(nameMap.get("Bronze sword")?.length).toBe(3);
  });

  test("items with different base names are grouped separately", async () => {
    const item1 = createMockItem(1, "Bronze sword");
    const item2 = createMockItem(2, "Iron dagger");
    const item3 = createMockItem(3, "Bronze sword (two)");

    await writeItemPage(item1);
    await writeItemPage(item2);
    await writeItemPage(item3);

    const nameMap = getItemNameMap();
    expect(nameMap.has("Bronze sword")).toBe(true);
    expect(nameMap.has("Iron dagger")).toBe(true);
    expect(nameMap.get("Bronze sword")?.length).toBe(2);
    expect(nameMap.get("Iron dagger")?.length).toBe(1);
  });

  test("items without parenthetical suffixes are handled correctly", async () => {
    const item1 = createMockItem(1, "Abyssal whip");

    await writeItemPage(item1);

    const nameMap = getItemNameMap();
    expect(nameMap.has("Abyssal whip")).toBe(true);
    expect(nameMap.get("Abyssal whip")?.length).toBe(1);
  });

  test("flushItemPages writes combined pages for items with same base name", async () => {
    const { writePageToFile } = jest.requireMock("../pages.utils");
    const item1 = createMockItem(1, "Bronze sword");
    const item2 = createMockItem(2, "Bronze sword (two)");
    const item3 = createMockItem(3, "Bronze sword (three)");

    await writeItemPage(item1);
    await writeItemPage(item2);
    await writeItemPage(item3);

    await flushItemPages();

    expect(writePageToFile).toHaveBeenCalledTimes(1);
    expect(writePageToFile).toHaveBeenCalledWith(
      expect.objectContaining({ build: expect.any(Function) }),
      "item",
      "Bronze sword",
      "1",
      true // isMultiChildren flag should be true for 3 items
    );
  });

  test("flushItemPages writes separate pages for items with different base names", async () => {
    const { writePageToFile } = jest.requireMock("../pages.utils");
    const item1 = createMockItem(1, "Bronze sword");
    const item2 = createMockItem(2, "Iron dagger");

    await writeItemPage(item1);
    await writeItemPage(item2);

    await flushItemPages();

    expect(writePageToFile).toHaveBeenCalledTimes(2);
    expect(writePageToFile).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ build: expect.any(Function) }),
      "item",
      "Bronze sword",
      "1",
      false // single item
    );
    expect(writePageToFile).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ build: expect.any(Function) }),
      "item",
      "Iron dagger",
      "2",
      false // single item
    );
  });
});
