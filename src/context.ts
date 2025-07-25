import { FlatCacheProvider, DiskCacheProvider } from "@/utils/cache2";

type CacheMediaWikiContext = {
  beta?: boolean;
  examines?: {
    npcs?: { [key: string]: string };
    scenery?: { [key: string]: string };
  };
  pages?: boolean;
  newCache?: string;
  oldCache?: string;
  oldCacheProvider?: FlatCacheProvider | DiskCacheProvider;
  newCacheProvider?: FlatCacheProvider | DiskCacheProvider;
  renders?: string;
  update?: string;
  updateDate?: string;
};

const Context: CacheMediaWikiContext = {};

export default Context;
