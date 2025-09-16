import { OpenRS2CacheEntry, ParsedCacheVersion } from "./types";

export const parseCacheVersion = (version: string): ParsedCacheVersion => {
  // Parse "2025-09-03-rev232" format
  const match = version.match(/^(\d{4}-\d{2}-\d{2})(?:-rev(\d+))?$/);
  if (!match) {
    throw new Error(
      `Invalid cache version format: ${version}. Expected format: YYYY-MM-DD-revXXX`
    );
  }

  const [, dateStr, revStr] = match;
  const date = new Date(dateStr + "T00:00:00.000Z");

  // Check if the date is valid (invalid dates result in NaN)
  if (isNaN(date.getTime())) {
    throw new Error(
      `Invalid cache version format: ${version}. Expected format: YYYY-MM-DD-revXXX`
    );
  }

  const revision = revStr ? parseInt(revStr, 10) : undefined;

  return { date, revision };
};

export const findCacheByVersion = (
  version: string,
  caches: OpenRS2CacheEntry[]
): OpenRS2CacheEntry | undefined => {
  const parsed = parseCacheVersion(version);

  // Filter to OSRS live caches only
  const osrsCaches = caches.filter(
    (cache) =>
      cache.scope === "runescape" &&
      cache.game === "oldschool" &&
      cache.environment === "live"
  );

  // Find cache with matching date (within same day)
  return osrsCaches.find((cache) => {
    const cacheDate = new Date(cache.timestamp);
    return (
      cacheDate.getUTCFullYear() === parsed.date.getUTCFullYear() &&
      cacheDate.getUTCMonth() === parsed.date.getUTCMonth() &&
      cacheDate.getUTCDate() === parsed.date.getUTCDate()
    );
  });
};
