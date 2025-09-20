import { OpenRS2CacheEntry, OpenRS2XTEAKey } from "./types";

export const fetchCacheList = async (): Promise<OpenRS2CacheEntry[]> => {
  console.debug("Fetching cache list from OpenRS2");
  const response = await fetch("https://archive.openrs2.org/caches.json");
  if (!response.ok) {
    throw new Error(`Failed to fetch cache list: ${response.statusText}`);
  }
  return response.json();
};

export const fetchCacheKeys = async (
  cacheId: number
): Promise<OpenRS2XTEAKey[]> => {
  console.debug(`Fetching keys for cache ID ${cacheId}`);
  const response = await fetch(
    `https://archive.openrs2.org/caches/runescape/${cacheId}/keys.json`
  );
  if (!response.ok) {
    throw new Error(
      `Failed to fetch keys for cache ${cacheId}: ${response.statusText}`
    );
  }
  return response.json();
};
