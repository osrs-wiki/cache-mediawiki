export type SwitchInfoboxItem = {
  text: string; // Label for the tab (e.g., "Royal servant", "In combat")
  item: string; // MediaWiki template content
};

export type SwitchInfoboxOptions = {
  items: SwitchInfoboxItem[];
};
