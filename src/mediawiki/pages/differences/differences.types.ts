import { Difference } from "../../../tasks/differences/differences.types";

import {
  Animation,
  Area,
  ConfigType,
  DBRow,
  Enum,
  IndexType,
  Item,
  NPC,
  Obj,
  Param,
  SpotAnim,
  Sprites,
  Struct,
  VarPlayer,
  Varbit,
} from "@/utils/cache2";
import { Loadable } from "@/utils/cache2/Loadable";

export type IndexFeature<T extends Loadable, Name> = {
  name: Name;
  identifiers: (keyof T)[];
  fields: (keyof T)[];
  urls?: IndexURLs;
};

export type IndexURLType = "abex" | "chisel";

export type IndexURLs = { [key in IndexURLType]?: string };

export type IndexFeatures =
  | IndexFeature<Animation, "Animations">
  | IndexFeature<Area, "Areas">
  | IndexFeature<DBRow, "Database Rows">
  | IndexFeature<Enum, "Enums">
  | IndexFeature<Item, "Items">
  | IndexFeature<NPC, "Npcs">
  | IndexFeature<Obj, "Objects">
  | IndexFeature<Param, "Params">
  | IndexFeature<SpotAnim, "Spot Anims">
  | IndexFeature<Sprites, "Sprites">
  | IndexFeature<Struct, "Structs">
  | IndexFeature<Varbit, "Varbits">
  | IndexFeature<VarPlayer, "VarPlayers">;

export const resultNameMap: { [key in Difference]: string } = {
  added: "New",
  changed: "Diff",
  removed: "Removed",
};

export const indexNameMap: {
  [key in IndexType]?: { [key: number]: IndexFeatures } | IndexFeatures;
} = {
  [IndexType.Configs]: {
    [ConfigType.Area]: {
      name: "Areas",
      identifiers: ["name", "id"],
      fields: ["category", "spriteId"],
      urls: {},
    },
    [ConfigType.Object]: {
      name: "Objects",
      identifiers: ["name", "id"],
      fields: ["gameVal", "actions"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/object_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/obj/",
      },
    },
    [ConfigType.Enum]: {
      name: "Enums",
      identifiers: ["id"],
      fields: ["defaultValue", "map"],
      urls: {
        chisel:
          "https://chisel.weirdgloop.org/structs/index.html?type=enums&id=",
        abex: "https://abextm.github.io/cache2/#/viewer/enum/",
      },
    },
    [ConfigType.Npc]: {
      name: "Npcs",
      identifiers: ["name", "id"],
      fields: ["gameVal", "combatLevel", "actions"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/npc_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/npc/",
      },
    },
    [ConfigType.Item]: {
      name: "Items",
      identifiers: ["name", "id"],
      fields: [
        "gameVal",
        "examine",
        "isMembers",
        "isGrandExchangable",
        "isStackable",
        "noteLinkedItem",
        "inventoryActions",
        "placeholderLinkedItem",
        "price",
        "weight",
      ],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/item_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/item/",
      },
    },
    [ConfigType.Params]: {
      name: "Params",
      identifiers: ["id"],
      fields: ["type", "defaultInt", "defaultString", "isMembers"],
      urls: {
        chisel:
          "https://chisel.weirdgloop.org/structs/index.html?type=enums&id=",
        abex: "https://abextm.github.io/cache2/#/viewer/enum/",
      },
    },
    [ConfigType.Struct]: {
      name: "Structs",
      identifiers: ["id"],
      fields: ["params"],
      urls: {
        chisel:
          "https://chisel.weirdgloop.org/structs/index.html?type=structs&id=",
        abex: "https://abextm.github.io/cache2/#/viewer/struct/",
      },
    },
    [ConfigType.DbRow]: {
      name: "Database Rows",
      identifiers: ["id"],
      fields: ["gameVal", "table", "values"],
      urls: {
        abex: "https://abextm.github.io/cache2/#/viewer/dbrow/",
      },
    },
    [ConfigType.SpotAnim]: {
      name: "Spot Anims",
      identifiers: ["id"],
      fields: ["gameVal", "modelId", "animationId"],
      urls: {},
    },
    [ConfigType.VarBit]: {
      name: "Varbits",
      identifiers: ["id"],
      fields: ["gameVal", "index", "leastSignificantBit", "mostSignificantBit"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/varbs/display?varbit=",
      },
    },
    [ConfigType.VarPlayer]: {
      name: "VarPlayers",
      identifiers: ["id"],
      fields: ["gameVal"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/varbs/display?varplayer=",
      },
    },
  },
  [IndexType.Sprites]: {
    name: "Sprites",
    identifiers: ["id"],
    fields: ["gameVal", "width", "height"],
    urls: {
      chisel: "",
      abex: "https://abextm.github.io/cache2/#/viewer/sprite/",
    },
  },
  [IndexType.Animations]: {
    name: "Animations",
    identifiers: ["id"],
    fields: ["gameVal", "debugName", "leftHandItem", "rightHandItem"],
    urls: {},
  },
};
