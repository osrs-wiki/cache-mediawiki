import fs from "fs/promises";
import path from "path";

import { fetchCacheList, fetchCacheKeys } from "./api";
import { findCacheByVersion } from "./cache-matcher";
import { OpenRS2XTEAKey } from "./types";

import { XTEAKeyManager } from "@/utils/cache2";

/**
 * Attempts to load XTEA keys from a local JSON file.
 * File naming convention: data/xtea/{revision}.json or data/xtea/{revision}.{N}.json
 * (e.g., data/xtea/235.json, data/xtea/235.4.json, data/xtea/235.2.json)
 *
 * @param cacheVersion The cache version string (e.g., "2025-11-19-rev235")
 * @returns The keys if found locally, or null if the file doesn't exist
 */
const loadLocalXTEAKeys = async (
  cacheVersion: string
): Promise<OpenRS2XTEAKey[] | null> => {
  try {
    // Extract revision from cache version (e.g., "2025-11-19-rev235" -> "235")
    const revisionMatch = cacheVersion.match(/rev(\d+)/);
    if (!revisionMatch) {
      return null;
    }

    const revision = revisionMatch[1];

    // Try to find any file matching the revision pattern (e.g., 235.json, 235.4.json, 235.2.json)
    const xteaDir = path.join(process.cwd(), "data", "xtea");

    try {
      const files = await fs.readdir(xteaDir);
      const matchingFile = files.find((file) => {
        return (
          file === `${revision}.json` ||
          (file.startsWith(`${revision}.`) && file.endsWith(".json"))
        );
      });

      if (matchingFile) {
        const filePath = path.join(xteaDir, matchingFile);
        const fileContent = await fs.readFile(filePath, "utf-8");
        const keys = JSON.parse(fileContent) as OpenRS2XTEAKey[];

        console.log(
          `Loaded ${keys.length} XTEA keys from local file: ${filePath}`
        );

        return keys;
      }
    } catch (error) {
      // Directory doesn't exist or isn't readable, continue to try full cache version
    }

    // Try full cache version as fallback (e.g., 2025-11-19-rev235.json)
    try {
      const filePath = path.join(xteaDir, `${cacheVersion}.json`);
      const fileContent = await fs.readFile(filePath, "utf-8");
      const keys = JSON.parse(fileContent) as OpenRS2XTEAKey[];

      console.log(
        `Loaded ${keys.length} XTEA keys from local file: ${filePath}`
      );

      return keys;
    } catch (error) {
      // File doesn't exist or isn't readable
    }

    return null;
  } catch (error) {
    console.warn(`Error loading local XTEA keys: ${error.message}`);
    return null;
  }
};

export const loadXTEAKeysForCache = async (
  cacheVersion: string
): Promise<XTEAKeyManager> => {
  console.log(`Loading XTEA keys for cache version: ${cacheVersion}`);

  const manager = new XTEAKeyManager();

  try {
    // First, try to load from local file
    const localKeys = await loadLocalXTEAKeys(cacheVersion);

    if (localKeys) {
      const keysLoaded = manager.loadKeys(localKeys);
      console.log(
        `Loaded ${keysLoaded} XTEA keys for cache ${cacheVersion} from local file`
      );
      return manager;
    }

    // Fall back to OpenRS2 API
    console.log("No local XTEA keys found, fetching from OpenRS2 API...");
    console.log("Fetching cache list from OpenRS2");

    const cacheList = await fetchCacheList();
    const cacheEntry = findCacheByVersion(cacheVersion, cacheList);

    if (!cacheEntry) {
      throw new Error(
        `Could not find cache entry for version: ${cacheVersion}`
      );
    }

    console.log(`Fetching keys for cache ID ${cacheEntry.id}`);
    const keys = await fetchCacheKeys(cacheEntry.id);

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
