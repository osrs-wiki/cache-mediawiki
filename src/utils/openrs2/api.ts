import { OpenRS2CacheEntry, OpenRS2XTEAKey } from "./types";

export const OpenRSAPICache: {
  cacheList: OpenRS2CacheEntry[];
  cacheKeys: Record<number, OpenRS2XTEAKey[]>;
} = {
  cacheList: [],
  cacheKeys: {},
};

export const fetchCacheList = async (): Promise<OpenRS2CacheEntry[]> => {
  if (OpenRSAPICache.cacheList.length > 0) {
    return OpenRSAPICache.cacheList;
  }
  console.debug("Fetching cache list from OpenRS2");
  const response = await fetch("https://archive.openrs2.org/caches.json");
  if (!response.ok) {
    throw new Error(`Failed to fetch cache list: ${response.statusText}`);
  }
  OpenRSAPICache.cacheList = await response.json();
  return OpenRSAPICache.cacheList;
};

export const fetchCacheKeys = async (
  cacheId: number
): Promise<OpenRS2XTEAKey[]> => {
  if (OpenRSAPICache.cacheKeys[cacheId]) {
    return OpenRSAPICache.cacheKeys[cacheId];
  }
  console.debug(`Fetching keys for cache ID ${cacheId}`);
  const response = await fetch(
    `https://archive.openrs2.org/caches/runescape/${cacheId}/keys.json`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch keys for cache ${cacheId}: ${response.statusText}`
    );
  }
  OpenRSAPICache.cacheKeys[cacheId] = await response.json();
  return OpenRSAPICache.cacheKeys[cacheId];
};
