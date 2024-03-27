type CacheMediaWikiContext = {
  examines?: {
    items?: { [key: string]: string };
    npcs?: { [key: string]: string };
  };
  infoboxes?: boolean;
  update?: string;
  updateDate?: string;
};

const Context: CacheMediaWikiContext = {};

export default Context;
