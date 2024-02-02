import { ArchiveData, ArchiveFile, FlatIndexData } from "../../utils/cache2";

export type FileContext = {
  archive: ArchiveData;
  index: FlatIndexData;
  file: ArchiveFile;
};
