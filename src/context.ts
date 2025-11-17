import { FlatCacheProvider, DiskCacheProvider } from "@/utils/cache2";

type CacheMediaWikiContext = {
  beta?: boolean;
  examines?: {
    npcs?: { [key: string]: string };
    scenery?: { [key: string]: string };
  };
  output?: "json" | "mediawiki" | "csv";
  pages?: boolean;
  newCache?: string;
  oldCache?: string;
  oldCacheProvider?: FlatCacheProvider | DiskCacheProvider;
  newCacheProvider?: FlatCacheProvider | DiskCacheProvider;
  newContentTemplate?: string;
  renders?: string;
  update?: string;
  updateDate?: string;
};

const Context: CacheMediaWikiContext = {};

export default Context;
