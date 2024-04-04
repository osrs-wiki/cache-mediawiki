import { DiskCacheProvider, FlatCacheProvider } from "@abextm/cache2";
import { readFile } from "fs/promises";

export type CacheSource = "github" | "local";
export type CacheFileType = "flat" | "disk";

export const getCacheProviderLocal = async (
  version: string,
  type: CacheFileType
) => {
  if (type === "disk") {
    return getCacheProviderDiskLocal(version);
  } else if (type === "flat") {
    return getCacheProviderFlatLocal(version);
  }
};

export const getCacheProviderDiskLocal = async (version: string) => {
  return new DiskCacheProvider({
    async getFile(name) {
      const ab = (await readFile(`./data/diskcache/${version}/${name}`)).buffer;
      return new Uint8Array(ab);
    },
  });
};

export const getCacheProviderFlatLocal = async (version: string) => {
  return new FlatCacheProvider({
    async getFile(name) {
      const ab = (await readFile(`./data/flatcache/${version}/${name}`)).buffer;
      return new Uint8Array(ab);
    },
  });
};

export const getCacheProviderGithub = async (version = "master") => {
  return new FlatCacheProvider({
    async getFile(name) {
      const req = await fetch(
        `https://raw.githubusercontent.com/abextm/osrs-cache/${version}/${name}`
      );
      if (!req.ok) {
        return;
      }
      const ab = await req.arrayBuffer();
      return new Uint8Array(ab);
    },
  });
};
