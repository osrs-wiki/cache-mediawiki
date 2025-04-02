type CacheMediaWikiContext = {
  examines?: {
    npcs?: { [key: string]: string };
    scenery?: { [key: string]: string };
  };
  infoboxes?: boolean;
  newCache?: string;
  oldCache?: string;
  renders?: string;
  update?: string;
  updateDate?: string;
};

const Context: CacheMediaWikiContext = {};

export default Context;
