import { buildItemInfobox } from "./item";
import {
  ATTACK_RANGE_PARAM,
  ATTACK_SPEED_PARAM,
  CRUSH_ATTACK_PARAM,
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DEFENCE_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  SLASH_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
  RANGED_AMMO_STRENGTH_PARAM,
  RANGED_EQUIPMENT_STRENGTH_PARAM,
} from "./item.utils";
import {
  CategoryID,
  Item,
  ItemID,
  Params,
  WearPos,
} from "../../../../utils/cache2";

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

describe("Item Infobox", () => {
  test("Item infobox should be generated", async () => {
    const itemInfobox = await buildItemInfobox(BASE_ITEM);
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox should be generated with weapon bonuses", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      wearpos1: WearPos.Weapon,
      category: 150 as CategoryID,
      params: new Params()
        .set(STAB_ATTACK_PARAM, 1)
        .set(SLASH_ATTACK_PARAM, 1)
        .set(CRUSH_ATTACK_PARAM, 1)
        .set(MAGIC_ATTACK_PARAM, 1)
        .set(RANGED_ATTACK_PARAM, 1)
        .set(ATTACK_SPEED_PARAM, 3)
        .set(ATTACK_RANGE_PARAM, 2),
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox should be generated with cape bonuses", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      wearpos1: WearPos.Cape,
      params: new Params()
        .set(SLASH_DEFENCE_PARAM, 1)
        .set(CRUSH_DEFENCE_PARAM, 1)
        .set(STAB_DEFENCE_PARAM, 1)
        .set(MAGIC_DEFENCE_PARAM, 1)
        .set(RANGED_DEFENCE_PARAM, 1),
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox with sub ops", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      inventoryActions: ["Test Action 1", "Test Action 2", "Test Action 3"],
      subops: [["Sub Action 1"], ["Sub Action 2.1", "Sub Action 2.2"], []],
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox should be generated with ranged ammo strength bonuses", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      wearpos1: WearPos.Weapon,
      category: 150 as CategoryID,
      params: new Params()
        .set(RANGED_ATTACK_PARAM, 75)
        .set(RANGED_AMMO_STRENGTH_PARAM, 35)
        .set(ATTACK_SPEED_PARAM, 4)
        .set(ATTACK_RANGE_PARAM, 5),
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox should be generated with ranged equipment strength bonuses", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      wearpos1: WearPos.Weapon,
      category: 150 as CategoryID,
      params: new Params()
        .set(RANGED_ATTACK_PARAM, 75)
        .set(RANGED_EQUIPMENT_STRENGTH_PARAM, 42)
        .set(ATTACK_SPEED_PARAM, 4)
        .set(ATTACK_RANGE_PARAM, 5),
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });

  test("Item infobox should be generated with head wearpos", async () => {
    const itemInfobox = await buildItemInfobox({
      ...BASE_ITEM,
      wearpos1: WearPos.Head,
      params: new Params()
        .set(SLASH_DEFENCE_PARAM, 1)
        .set(CRUSH_DEFENCE_PARAM, 1)
        .set(STAB_DEFENCE_PARAM, 1)
        .set(MAGIC_DEFENCE_PARAM, 1)
        .set(RANGED_DEFENCE_PARAM, 1),
    });
    expect(itemInfobox.build()).toMatchSnapshot();
  });
});
