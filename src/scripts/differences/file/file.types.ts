import {
  ItemID,
  ModelID,
  WearPos,
  HSL,
  TextureID,
  CategoryID,
  Params,
} from "../../../utils/cache2";
import { FileContext } from "../differences.types";

export type ResultValue =
  | string
  | number
  | boolean
  | string[]
  | ItemID
  | ModelID
  | WearPos
  | HSL[]
  | TextureID[]
  | CategoryID
  | ItemID[]
  | number[]
  | Params
  | undefined;

export type ComaparisonResult = {
  [key: string]: {
    oldValue: ResultValue;
    newValue: ResultValue;
  };
};

export type CompareFn = (
  oldFile: FileContext,
  newFile: FileContext
) => ComaparisonResult;
