import { FlatCacheProvider, DiskCacheProvider } from "./utils/cache2";

type CacheMediaWikiContext = {
  examines?: {
    npcs?: { [key: string]: string };
    scenery?: { [key: string]: string };
  };
  infoboxes?: boolean;
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
