import { fetchCacheList, fetchCacheKeys } from "./api";
import { findCacheByVersion } from "./cache-matcher";

import { XTEAKeyManager } from "@/utils/cache2";

export const loadXTEAKeysForCache = async (
  cacheVersion: string
): Promise<XTEAKeyManager> => {
  console.log(`Loading XTEA keys for cache version: ${cacheVersion}`);

  try {
    const cacheList = await fetchCacheList();
    const cacheEntry = findCacheByVersion(cacheVersion, cacheList);

    if (!cacheEntry) {
      throw new Error(
        `Could not find cache entry for version: ${cacheVersion}`
      );
    }

    const keys = await fetchCacheKeys(cacheEntry.id);
    const manager = new XTEAKeyManager();
    const keysLoaded = manager.loadKeys(keys);

    console.log(
      `Loaded ${keysLoaded} XTEA keys for cache ${cacheVersion} (OpenRS2 ID: ${cacheEntry.id})`
    );

    return manager;
  } catch (error) {
    console.error(
      `Failed to load XTEA keys for cache ${cacheVersion}: ${error.message}`
    );
    throw error;
  }
};
