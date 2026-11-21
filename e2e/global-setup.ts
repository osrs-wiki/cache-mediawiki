import { getCacheVersions } from "./utils/release-lookup";

export default async function globalSetup(): Promise<void> {
  const { oldVersion, newVersion } = await getCacheVersions();
  process.env.E2E_OLD_CACHE_VERSION = oldVersion;
  process.env.E2E_NEW_CACHE_VERSION = newVersion;
  console.log(`E2E cache versions: ${oldVersion} -> ${newVersion}`);
}
