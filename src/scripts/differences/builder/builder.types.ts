import { IndexType, Item, NPC, Obj, Struct } from "../../../utils/cache2";
import { PerFileLoadable } from "../../../utils/cache2/Loadable";
import { Difference } from "../differences.types";

export type IndexFeature<T extends PerFileLoadable, Name> = {
  name: Name;
  identifiers: (keyof T)[];
  fields: (keyof T)[];
};

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
    },
    9: {
      name: "Npcs",
      identifiers: ["name", "id"],
      fields: ["combatLevel", "actions"],
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
    },
    34: {
      name: "Structs",
      identifiers: ["id"],
      fields: ["params"],
    },
  },
};
