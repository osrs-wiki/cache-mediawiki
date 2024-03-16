import { readFile } from "fs/promises";

import { FlatCacheProvider } from "./cache2";

export type CacheMethod = "github" | "local";

export const getCacheProvider = async (version: string) => {
  return new FlatCacheProvider({
    async getFile(name) {
      const ab = (await readFile(`./data/cache/${version}/${name}`)).buffer;
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
