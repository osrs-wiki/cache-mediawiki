export type OpenRS2CacheEntry = {
  id: number;
  scope: string;
  game: string;
  environment: string;
  language: string;
  builds: Array<{ major: number; minor: number | null }>;
  timestamp: string;
  sources: string[];
  valid_indexes: number;
  indexes: number;
  valid_groups: number;
  groups: number;
  valid_keys: number;
  keys: number;
  size: number;
  blocks: number;
  disk_store_valid: boolean;
};

export type OpenRS2XTEAKey = {
  archive: number;
  group: number;
  name_hash: number;
  name: string;
  mapsquare: number;
  key: [number, number, number, number];
};

export type ParsedCacheVersion = {
  date: Date;
  revision?: number;
};
