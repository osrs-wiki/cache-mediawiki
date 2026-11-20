import {
  FALLBACK_NEW_CACHE_VERSION,
  FALLBACK_OLD_CACHE_VERSION,
} from "./cache-versions";

export interface CacheVersions {
  oldVersion: string;
  newVersion: string;
}

const RELEASES_URL = "https://api.github.com/repos/abextm/osrs-cache/releases";
const PAGE_SIZE = 100;

export async function getCacheVersions(): Promise<CacheVersions> {
  try {
    const tags: string[] = [];

    for (let page = 1; tags.length < 2; page++) {
      const response = await fetch(
        `${RELEASES_URL}?per_page=${PAGE_SIZE}&page=${page}`,
        {
          headers: { Accept: "application/vnd.github+json" },
          signal: AbortSignal.timeout(10000),
        }
      );
      if (!response.ok) {
        throw new Error(`GitHub returned HTTP ${response.status}`);
      }

      const releases: unknown = await response.json();
      if (!Array.isArray(releases)) {
        throw new Error("GitHub returned an invalid release list");
      }

      for (const release of releases) {
        if (
          !release ||
          typeof release !== "object" ||
          typeof release.tag_name !== "string" ||
          typeof release.draft !== "boolean" ||
          typeof release.prerelease !== "boolean"
        ) {
          throw new Error("GitHub returned invalid release data");
        }

        if (
          !release.draft &&
          !release.prerelease &&
          /^\d{4}-\d{2}-\d{2}-rev\d+$/.test(release.tag_name) &&
          release.tag_name.trim() === release.tag_name &&
          !tags.includes(release.tag_name)
        ) {
          tags.push(release.tag_name);
          if (tags.length === 2) {
            return { newVersion: tags[0], oldVersion: tags[1] };
          }
        }
      }

      if (releases.length < PAGE_SIZE) {
        throw new Error("GitHub returned fewer than two matching releases");
      }
    }

    throw new Error("Unable to select two cache releases");
  } catch (error) {
    console.warn(
      `Could not resolve osrs-cache releases (${error}); using fallback versions ${FALLBACK_OLD_CACHE_VERSION} and ${FALLBACK_NEW_CACHE_VERSION}.`
    );
    return {
      oldVersion: FALLBACK_OLD_CACHE_VERSION,
      newVersion: FALLBACK_NEW_CACHE_VERSION,
    };
  }
}
