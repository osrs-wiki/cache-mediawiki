import InfoboxItem from "./InfoboxItem";

import { Item, ItemID, Params, WearPos } from "@/utils/cache2";

const BASE_ITEM: Item = {
  name: "Test Item",
  isMembers: true,
  isGrandExchangable: true,
  id: 1234 as ItemID,
  inventoryModel: undefined,
  examine: "Examine text.",
  zoom2d: 0,
  xan2d: 0,
  yan2d: 0,
  offsetX2d: 0,
  offsetY2d: 0,
  isStackable: false,
  price: 0,
  wearpos1: undefined,
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
  inventoryActions: ["Test Action"],
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

describe("IfnoboxItem", () => {
  test("InfoboxItem - base", () => {
    const item = InfoboxItem(BASE_ITEM);
    expect(item).toMatchSnapshot();
  });

  test("InfoboxItem - with wearpos1 >= 0", () => {
    const item = InfoboxItem({ ...BASE_ITEM, wearpos1: WearPos.Head });
    expect(item).toMatchSnapshot();
  });

  test("InfoboxItem - with stack variants", () => {
    const item = InfoboxItem({
      ...BASE_ITEM,
      stackVariantItems: [
        1 as ItemID,
        2 as ItemID,
        3 as ItemID,
        4 as ItemID,
        5 as ItemID,
      ],
      stackVariantQuantities: [10, 20, 30, 40, 50],
    });
    expect(item).toMatchSnapshot();
  });

  test("InfoboxItem - with stack variants that are all 0", () => {
    const item = InfoboxItem({
      ...BASE_ITEM,
      stackVariantItems: [0 as ItemID, 0 as ItemID, 0 as ItemID],
      stackVariantQuantities: [0, 0, 0],
    });
    expect(item).toMatchSnapshot();
  });
});
