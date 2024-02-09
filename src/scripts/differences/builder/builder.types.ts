import { IndexType, Item, NPC, Obj, Struct } from "../../../utils/cache2";
import { PerFileLoadable } from "../../../utils/cache2/Loadable";

export type IndexFeature<T extends PerFileLoadable, Name> = {
  name: Name;
  fields: (keyof T)[];
};

export type IndexFeatures =
  | IndexFeature<Item, "Items">
  | IndexFeature<NPC, "Npcs">
  | IndexFeature<Obj, "Objects">
  | IndexFeature<Struct, "Structs">;

export const indexNameMap: {
  [key in IndexType]?: { [key: number]: IndexFeatures } | IndexFeatures;
} = {
  2: {
    6: {
      name: "Objects",
      fields: ["name", "id", "actions"],
    },
    9: {
      name: "Npcs",
      fields: ["name", "id", "combatLevel", "actions"],
    },
    10: {
      name: "Items",
      fields: [
        "name",
        "id",
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
      fields: ["id", "params"],
    },
  },
};
