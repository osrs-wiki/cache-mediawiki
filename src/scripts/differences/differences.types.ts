import { CacheMethod } from "../../utils/cache";
import {
  ArchiveData,
  ArchiveFile,
  CategoryID,
  FlatIndexData,
  HSL,
  ItemID,
  ModelID,
  Params,
  TextureID,
  WearPos,
} from "../../utils/cache2";

export type DifferencesParams = {
  newVersion: string;
  oldVersion: string;
  method: CacheMethod;
};

export type FileContext = {
  archive: ArchiveData;
  index: FlatIndexData;
  file: ArchiveFile;
};

export type Result = { [key: string]: ResultValue };

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
  | object
  | undefined;

export type CacheDifferences = {
  [key in number]?: IndexDifferences;
};

export type IndexDifferences = {
  [key: number]: ArchiveDifferences;
};

export type ArchiveDifferences = {
  [key: number]: FileDifferences;
};

export type Difference = "added" | "changed" | "removed";

export type ChangedResult = {
  [key: string]: {
    oldValue: ResultValue;
    newValue: ResultValue;
  };
};

export type FileDifferences = {
  added?: Result;
  changed?: ChangedResult;
  removed?: Result;
};

export type CompareFn = (params: {
  oldFile?: FileContext;
  newFile?: FileContext;
}) => FileDifferences;
