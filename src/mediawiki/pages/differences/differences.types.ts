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
  Region,
  SpotAnim,
  Sprites,
  Struct,
  VarPlayer,
  Varbit,
  Widget,
} from "@/utils/cache2";
import { Loadable } from "@/utils/cache2/Loadable";
import { regionToWorldMapURL } from "@/utils/url-generation";

export type IndexFeature<T extends Loadable, Name> = {
  name: Name;
  identifiers: (keyof T)[];
  fields: (keyof T)[];
  urls?: IndexFieldURLs;
};

export type IndexURLType = "abex" | "chisel" | "world";

// URL Generator function signature
export type URLGeneratorFunction = (
  value: unknown,
  context?: URLGeneratorContext
) => string;

// Context provided to URL generator functions
export type URLGeneratorContext = {
  fieldName: string;
  entityType: string;
  allFields?: Record<string, unknown>;
};

// Template URL with placeholder substitution
export type TemplateURL = string; // Contains {fieldName} placeholders

// URL definition for a specific provider
export type URLDefinition = TemplateURL | URLGeneratorFunction;

// Field-specific URL mapping
export type FieldURLs = {
  [provider in IndexURLType]?: URLDefinition;
};

// New field-specific URL structure
export type IndexFieldURLs = {
  [fieldName: string]: FieldURLs;
};

export type IndexFeatures =
  | IndexFeature<Animation, "Animations">
  | IndexFeature<Area, "Areas">
  | IndexFeature<DBRow, "Database Rows">
  | IndexFeature<Enum, "Enums">
  | IndexFeature<Item, "Items">
  | IndexFeature<NPC, "Npcs">
  | IndexFeature<Obj, "Objects">
  | IndexFeature<Param, "Params">
  | IndexFeature<Region, "Regions">
  | IndexFeature<SpotAnim, "Spot Anims">
  | IndexFeature<Sprites, "Sprites">
  | IndexFeature<Struct, "Structs">
  | IndexFeature<Varbit, "Varbits">
  | IndexFeature<VarPlayer, "VarPlayers">
  | IndexFeature<Widget, "Widgets">;

export const resultNameMap: { [key in Difference]: string } = {
  added: "New",
  changed: "Diff",
  removed: "Removed",
};

export const indexNameMap: {
  [key in IndexType]?: { [key: number]: IndexFeatures } | IndexFeatures;
} = {
  [IndexType.Configs]: {
    [ConfigType.Sequence]: {
      name: "Animations",
      identifiers: ["id", "gameVal"],
      fields: ["debugName", "leftHandItem", "rightHandItem"],
      urls: {},
    },
    [ConfigType.Area]: {
      name: "Areas",
      identifiers: ["name", "id"],
      fields: ["category", "spriteId"],
      urls: {},
    },
    [ConfigType.Object]: {
      name: "Objects",
      identifiers: ["name", "id", "gameVal"],
      fields: ["actions"],
      urls: {
        id: {
          chisel: "https://chisel.weirdgloop.org/moid/object_id.html#{id}",
          abex: "https://abextm.github.io/cache2/#/viewer/obj/{id}",
        },
      },
    },
    [ConfigType.Enum]: {
      name: "Enums",
      identifiers: ["id"],
      fields: ["defaultValue", "map"],
      urls: {
        id: {
          chisel:
            "https://chisel.weirdgloop.org/structs/index.html?type=enums&id={id}",
          abex: "https://abextm.github.io/cache2/#/viewer/enum/{id}",
        },
      },
    },
    [ConfigType.Npc]: {
      name: "Npcs",
      identifiers: ["name", "id", "gameVal"],
      fields: ["combatLevel", "actions"],
      urls: {
        id: {
          chisel: "https://chisel.weirdgloop.org/moid/npc_id.html#{id}",
          abex: "https://abextm.github.io/cache2/#/viewer/npc/{id}",
        },
      },
    },
    [ConfigType.Item]: {
      name: "Items",
      identifiers: ["name", "id", "gameVal"],
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
      urls: {
        id: {
          chisel: "https://chisel.weirdgloop.org/moid/item_id.html#{id}",
          abex: "https://abextm.github.io/cache2/#/viewer/item/{id}",
        },
      },
    },
    [ConfigType.Params]: {
      name: "Params",
      identifiers: ["id"],
      fields: ["type", "defaultInt", "defaultString", "isMembers"],
      urls: {
        id: {
          chisel:
            "https://chisel.weirdgloop.org/structs/index.html?type=enums&id={id}",
          abex: "https://abextm.github.io/cache2/#/viewer/enum/{id}",
        },
      },
    },
    [ConfigType.Struct]: {
      name: "Structs",
      identifiers: ["id"],
      fields: ["params"],
      urls: {
        id: {
          chisel:
            "https://chisel.weirdgloop.org/structs/index.html?type=structs&id={id}",
          abex: "https://abextm.github.io/cache2/#/viewer/struct/{id}",
        },
      },
    },
    [ConfigType.DbRow]: {
      name: "Database Rows",
      identifiers: ["id", "gameVal"],
      fields: ["table", "values"],
      urls: {
        id: {
          abex: "https://abextm.github.io/cache2/#/viewer/dbrow/{id}",
        },
      },
    },
    [ConfigType.SpotAnim]: {
      name: "Spot Anims",
      identifiers: ["id", "gameVal"],
      fields: ["modelId", "animationId"],
      urls: {},
    },
    [ConfigType.VarBit]: {
      name: "Varbits",
      identifiers: ["id", "gameVal"],
      fields: ["index", "leastSignificantBit", "mostSignificantBit"],
      urls: {
        id: {
          chisel: "https://chisel.weirdgloop.org/varbs/display?varbit={id}",
        },
      },
    },
    [ConfigType.VarPlayer]: {
      name: "VarPlayers",
      identifiers: ["id", "gameVal"],
      fields: [],
      urls: {
        id: {
          chisel: "https://chisel.weirdgloop.org/varbs/display?varplayer={id}",
        },
      },
    },
  },
  [IndexType.Interfaces]: {
    name: "Widgets",
    identifiers: ["id", "gameVal"],
    fields: [
      "parentId",
      "type",
      "name",
      "text",
      "tooltip",
      "actions",
      "configActions",
    ],
    urls: {
      id: {
        abex: "https://abextm.github.io/cache2/#/viewer/interface/{id}",
      },
    },
  },
  [IndexType.Maps]: {
    name: "Regions",
    identifiers: ["id", "name"],
    fields: ["regionX", "regionY"],
    urls: {
      id: {
        world: regionToWorldMapURL,
      },
    },
  },
  [IndexType.Sprites]: {
    name: "Sprites",
    identifiers: ["id", "gameVal"],
    fields: ["width", "height"],
    urls: {
      id: {
        abex: "https://abextm.github.io/cache2/#/viewer/sprite/{id}",
      },
    },
  },
};
