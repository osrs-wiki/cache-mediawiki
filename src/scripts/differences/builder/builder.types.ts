import { IndexType, Item, NPC, Obj, Struct } from "../../../utils/cache2";
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
  | IndexFeature<Item, "Items">
  | IndexFeature<NPC, "Npcs">
  | IndexFeature<Obj, "Objects">
  | IndexFeature<Struct, "Structs">;

export const resultNameMap: { [key in Difference]: string } = {
  added: "New",
  changed: "Diff",
  removed: "Removed",
};

export const indexNameMap: {
  [key in IndexType]?: { [key: number]: IndexFeatures } | IndexFeatures;
} = {
  2: {
    6: {
      name: "Objects",
      identifiers: ["name", "id"],
      fields: ["actions"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/object_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/obj/",
      },
    },
    9: {
      name: "Npcs",
      identifiers: ["name", "id"],
      fields: ["combatLevel", "actions"],
      urls: {
        chisel: "https://chisel.weirdgloop.org/moid/npc_id.html#",
        abex: "https://abextm.github.io/cache2/#/viewer/npc/",
      },
    },
    10: {
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
    34: {
      name: "Structs",
      identifiers: ["id"],
      fields: ["params"],
      urls: {
        chisel:
          "https://chisel.weirdgloop.org/structs/index.html?type=structs&id=",
        abex: "https://abextm.github.io/cache2/#/viewer/struct/",
      },
    },
  },
};
