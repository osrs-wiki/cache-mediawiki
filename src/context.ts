type CacheMediaWikiContext = {
  examines?: {
    npcs?: { [key: string]: string };
    scenery?: { [key: string]: string };
  };
  infoboxes?: boolean;
  renders?: boolean;
  update?: string;
  updateDate?: string;
};

const Context: CacheMediaWikiContext = {};

export default Context;
