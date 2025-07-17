import { FileContext } from "../differences.types";

import { IndexType } from "@/utils/cache2";

export type CacheChangeListener = {
  index: IndexType;
  archive?: number;
  file?: number;
  handler: (context: {
    oldFile?: FileContext;
    newFile?: FileContext;
  }) => Promise<void>;
};
