import {
  ConfigType,
  DBRow,
  Enum,
  IndexType,
  Item,
  NPC,
  Obj,
  Param,
  Sprites,
  Struct,
} from "../../../utils/cache2";
import { Loadable } from "../../../utils/cache2/Loadable";
import { Difference } from "../differences.types";

export type IndexFeature<T extends Loadable, Name> = {
  name: Name;
  identifiers: (keyof T)[];
  fields: (keyof T)[];
  loadable: Loadable;
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
  | IndexFeature<Sprites, "Sprites">
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
      loadable: Obj,
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/object_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/obj/",
      },
    },
    [ConfigType.Enum]: {
      name: "Enums",
      identifiers: ["id"],
      fields: ["defaultValue", "map"],
      loadable: Enum,
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
      loadable: NPC,
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/npc_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/npc/",
      },
    },
    [ConfigType.Item]: {
      name: "Items",
      identifiers: ["name", "id"],
      fields: [
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
      loadable: Item,
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/item_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/item/",
      },
    },
    [ConfigType.Params]: {
      name: "Params",
      identifiers: ["id"],
      fields: ["type", "defaultInt", "defaultString", "isMembers"],
      loadable: Param,
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
      loadable: Struct,
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
      loadable: DBRow,
      urls: {
        abex: "https://abextm.github.io/cache2/#/viewer/dbrow/",
      },
    },
  },
  [IndexType.Sprites]: {
    name: "Sprites",
    identifiers: ["id"],
    fields: ["width", "height"],
    loadable: Sprites,
    urls: {
      chisel: "",
      abex: "https://abextm.github.io/cache2/#/viewer/sprite/",
    },
  },
};
