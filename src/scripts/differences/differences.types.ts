import {
  ArchiveData,
  ArchiveFile,
  CategoryID,
  FlatIndexData,
  HSL,
  IndexType,
  ItemID,
  ModelID,
  Params,
  TextureID,
  WearPos,
} from "../../utils/cache2";

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

export type FileDifferences = {
  [key: string]: {
    added?: Result;
    changed?: {
      oldValue: ResultValue;
      newValue: ResultValue;
    };
    removed?: Result;
  };
};

export type CompareFn = (params: {
  oldFile?: FileContext;
  newFile?: FileContext;
}) => FileDifferences;
