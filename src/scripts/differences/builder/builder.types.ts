import {
  ConfigType,
  DBRow,
  Enum,
  IndexType,
  Item,
  NPC,
  Obj,
  Param,
  Struct,
} from "../../../utils/cache2";
import { PerFileLoadable } from "../../../utils/cache2/Loadable";
import { Difference } from "../differences.types";

export type IndexFeature<T extends PerFileLoadable, Name> = {
  name: Name;
  identifiers: (keyof T)[];
  fields: (keyof T)[];
  urls?: IndexURLs;
};

export type IndexURLType = "abex" | "chisel";

export type IndexURLs = { [key in IndexURLType]?: string };

export type IndexFeatures =
  | IndexFeature<DBRow, "Database Rows">
  | IndexFeature<Enum, "Enums">
  | IndexFeature<Item, "Items">
  | IndexFeature<NPC, "Npcs">
  | IndexFeature<Obj, "Objects">
  | IndexFeature<Param, "Params">
  | IndexFeature<Struct, "Structs">;

export const resultNameMap: { [key in Difference]: string } = {
  added: "New",
  changed: "Diff",
  removed: "Removed",
};

export const indexNameMap: {
  [key in IndexType]?: { [key: number]: IndexFeatures } | IndexFeatures;
} = {
  [IndexType.Configs]: {
    [ConfigType.Object]: {
      name: "Objects",
      identifiers: ["name", "id"],
      fields: ["actions"],
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
      fields: ["combatLevel", "actions"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/npc_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/npc/",
      },
    },
    [ConfigType.Item]: {
      name: "Items",
      identifiers: ["name", "id"],
      fields: [
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
      fields: ["table", "values"],
      urls: {
        abex: "https://abextm.github.io/cache2/#/viewer/dbrow/",
      },
    },
  },
};
