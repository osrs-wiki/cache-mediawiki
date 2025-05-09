/* eslint-disable @typescript-eslint/no-namespace */
const NewTypeType: unique symbol = undefined!;
export type NewType<T, Name extends string> = T & {
  // @internal
  readonly [Tag in `~tag ${Name}`]: typeof NewTypeType;
};
export type AliasType<T, Name extends string> = T | NewType<T, Name>;

type TypedArray =
  | Uint8Array
  | Int8Array
  | Uint8ClampedArray
  | Uint16Array
  | Int16Array
  | Uint32Array
  | Int32Array
  | BigUint64Array
  | BigInt64Array
  | Float32Array
  | Float64Array;
export type PrimitiveArray<T extends A[0], A extends TypedArray> = A & {
  [index: number]: T;
};

export enum CompressionType {
  NONE = 0,
  BZ2 = 1,
  GZIP = 2,
}

export type XTEAKey = [number, number, number, number];

export type WearPos = NewType<number, "WearPos">;

export type ScriptVarChar = NewType<number, "ScriptVarChar">;
export type ScriptVarID = NewType<number, "ScriptVarID">;

export type AnimationID = NewType<number, "AnimationID">;
export type AreaID = NewType<number, "AreaID">;
export type CategoryID = NewType<number, "CategoryID">;
export type DBRowID = NewType<number, "DBRowID">;
export type DBTableID = NewType<number, "DBTableID">;
export type DBColumnID = NewType<number, "DBColumnID">;
export type EnumID = NewType<number, "EnumID">;
export type FontID = NewType<number, "FontID">;
export type GameValID = NewType<number, "GameValID">;
export type HealthBarID = NewType<number, "HealthBaID">;
export type HitsplatID = NewType<number, "HitsplatID">;
export type ItemID = NewType<number, "ItemID">;
export type KitID = NewType<number, "KitID">;
export type MapElementID = NewType<number, "MapElementID">;
export type MapSceneIconID = NewType<number, "MapSceneIconID">;
export type ModelID = NewType<number, "ModelID">;
export type NPCID = NewType<number, "NPCID">;
export type ObjID = NewType<number, "ObjID">;
export type ParamID = NewType<number, "ParamID">;
export type PoseID = NewType<number, "PoseID">;
export type SkeletonID = NewType<number, "SkeletonID">;
export type SoundEffectID = NewType<number, "SoundEffectID">;
export type SpotAnimID = NewType<number, "SpotAnimID">;
export type SpriteID = NewType<number, "SpriteID">;
export type StructID = NewType<number, "StructID">;
export type TextureID = NewType<number, "TextureID">;
export type UnderlayID = NewType<number, "UnderlayID">;
export type VarbitID = NewType<number, "VarbitID">;
export type VarPID = NewType<number, "VarPID">;

export type HSL = AliasType<number, "HSL">;
export type RGB = AliasType<number, "RGB">;

export type WorldPoint = NewType<number, "WorldPoint">;
export type ObjType = NewType<number, "ObjType">;

export type PreAnimMoveMode = NewType<number, "PreAnimMoveMode">;
export type PostAnimMoveMode = NewType<number, "PostAnimMoveMode">;
export type AnimRestartMode = NewType<number, "AnimRestartMode">;
export type AnimMayaID = NewType<number, "AnimMayaID">;

export class Params extends Map<ParamID, string | number> {}

export type KitOrItem = { kit: KitID } | { item: ItemID } | undefined;

function makeByID<T extends number>(): (
  this: object,
  id: T
) => string | undefined {
  let byID: string[] | undefined;
  return function (id: T) {
    if (byID === undefined) {
      byID = [];
      for (const [k, v] of Object.entries(this)) {
        if (typeof v === "number") {
          byID[v] = k;
        }
      }
    }
    return byID[id];
  };
}

export namespace WearPos {
  export const Head = <WearPos>0;
  export const Cape = <WearPos>1;
  export const Amulet = <WearPos>2;
  export const Weapon = <WearPos>3;
  export const Torso = <WearPos>4;
  export const Shield = <WearPos>5;
  export const Arms = <WearPos>6;
  export const Legs = <WearPos>7;
  export const Hair = <WearPos>8;
  export const Hands = <WearPos>9;
  export const Boots = <WearPos>10;
  export const Jaw = <WearPos>11;
  export const Ring = <WearPos>12;
  export const Ammo = <WearPos>13;

  export const byID = makeByID<WearPos>();
}

export namespace ObjType {
  export const WallStraight = <ObjType>0;
  export const WallDiagonalCorner = <ObjType>1;
  export const WallCorner = <ObjType>2;
  export const WallSquareCorner = <ObjType>3;
  export const WallDecorStraightNoOffset = <ObjType>4;
  export const WallDecorStraightOffset = <ObjType>5;
  export const WallDecorDiagonalOffset = <ObjType>6;
  export const WallDecorDiagonalNoOffset = <ObjType>7;
  export const WallDecorDiagonalBoth = <ObjType>8;
  export const WallDiagonal = <ObjType>9;
  export const CentrepieceStraight = <ObjType>10;
  export const CentrepieceDiagonal = <ObjType>11;
  export const RoofStraight = <ObjType>12;
  export const RoofDiagonalWithRoofEdge = <ObjType>13;
  export const RoofDiagonal = <ObjType>14;
  export const RoofCornerConcave = <ObjType>15;
  export const RoofCornerConvex = <ObjType>16;
  export const RoofFlat = <ObjType>17;
  export const RoofEdgeStraight = <ObjType>18;
  export const RoofEdgeDiagonalCorner = <ObjType>19;
  export const RoofEdgeCorner = <ObjType>20;
  export const RoofEdgeSquarecorner = <ObjType>21;
  export const GroundDecor = <ObjType>22;

  export const byID = makeByID<ObjType>();
}

export namespace PreAnimMoveMode {
  export const DelayMove = 0 as PreAnimMoveMode;
  export const DelayAnim = 1 as PreAnimMoveMode;
  export const Merge = 2 as PreAnimMoveMode;
  export const byID = makeByID<PreAnimMoveMode>();
}
export namespace PostAnimMoveMode {
  export const DelayMove = 0 as PostAnimMoveMode;
  export const AbortAnim = 1 as PostAnimMoveMode;
  export const Merge = 2 as PostAnimMoveMode;
  export const byID = makeByID<PostAnimMoveMode>();
}
export namespace AnimRestartMode {
  export const Continue = 0 as AnimRestartMode;
  export const Restart = 1 as AnimRestartMode;
  export const ResetLoops = 2 as AnimRestartMode;
  export const byID = makeByID<AnimRestartMode>();
}

export namespace DBColumnID {
  export function pack(
    table: DBTableID,
    column: number,
    tupleIndex = 0
  ): DBColumnID {
    return ((table << 12) |
      ((column & 0xff) << 4) |
      (tupleIndex & 0xf)) as DBColumnID;
  }
  export function unpack(
    c: DBColumnID
  ): [table: DBTableID, column: number, tupleIndex: number] {
    return [(c >>> 12) as DBTableID, (c >>> 4) & 0xff, c & 0xf];
  }
}

export enum IndexType {
  Animations = 0,
  Skeletons = 1,
  Configs = 2,
  Interfaces = 3,
  SoundEffects = 4,
  Maps = 5,
  MusicTracks = 6,
  Models = 7,
  Sprites = 8,
  Textures = 9,
  Binary = 10,
  MusicJingles = 11,
  ClientScripts = 12,
  Fonts = 13,
  MusicSamples = 14,
  MusicPatches = 15,
  Unused = 16,
  WorldMapGeography = 17,
  WorldMap = 18,
  WorldMapGrounds = 19,
  DbTableIndex = 21,
  Animayas = 22,
  GameVals = 23,
}

export enum ConfigType {
  Underlay = 1,
  IndentityKit = 3,
  Overlay = 4,
  Inventory = 5,
  Object = 6,
  Enum = 8,
  Npc = 9,
  Item = 10,
  Params = 11,
  Sequence = 12,
  SpotAnim = 13,
  VarBit = 14,
  VarClientString = 15,
  VarPlayer = 16,
  VarClient = 19,
  Hitsplat = 32,
  Healthbar = 33,
  Struct = 34,
  Area = 35,
  DbRow = 38,
  DbTable = 39,
}

export enum GameValType {
  Items = 0,
  Npcs = 1,
  Inventories = 2,
  Varps = 3,
  VarBits = 4,
  Objects = 6,
  Animations = 7,
  SpotAnims = 8,
  DBRows = 9,
  DBTables = 10,
  Jingles = 11,
  Sprites = 12,
  Interfaces = 13,
}
