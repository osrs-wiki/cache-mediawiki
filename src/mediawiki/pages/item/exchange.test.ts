import { exchangePageBuilder } from "./exchange";

import {
  Item,
  ItemID,
  Params,
  EntityOps,
} from "@/utils/cache2";

const createMockItem = (id: number, name: string): Item => {
  return {
    name,
    isMembers: true,
    isTradeable: true,
    isGrandExchangable: true,
    hasVar: false,
    id: id as ItemID,
    inventoryModel: undefined,
    examine: "I hope my clothes don't catch on fire.",
    zoom2d: 0,
    xan2d: 0,
    yan2d: 0,
    offsetX2d: 0,
    offsetY2d: 0,
    isStackable: false,
    price: 21000,
    wearpos1: undefined,
    wearpos2: undefined,
    wearpos3: undefined,
    weight: 100,
    maleModel: undefined,
    maleOffset: 0,
    maleModel1: undefined,
    femaleModel: undefined,
    femaleOffset: 0,
    femaleModel1: undefined,
    groundOps: new EntityOps(),
    inventoryOps: [],
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
    maleChatheadModel1: undefined,
    femaleChatheadModel1: undefined,
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
  } as Item;
};

describe("Exchange page", () => {
  test("Exchange page should be generated", () => {
    const item = createMockItem(34425, "Amulet of fire");
    const builder = exchangePageBuilder(item);

    expect(builder.build()).toBe(`return {
    itemId     = 34425,
    icon       = 'Amulet of fire.png',
    item       = 'Amulet of fire',
    value      = 21000,
    limit      = nil,
    members    = true,
    category   = nil,
    examine    = 'I hope my clothes don\\'t catch on fire.'
}`);
  });
});