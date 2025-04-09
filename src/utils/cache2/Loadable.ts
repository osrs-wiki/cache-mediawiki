import { CacheProvider } from "./Cache";
import { Reader } from "./Reader";

type LoadableType<I extends Loadable, ARGS extends unknown[]> = {
  decode(reader: Reader, ...args: ARGS): I;
  loadData(cache: CacheProvider, ...args: ARGS): Promise<Reader | undefined>;
};

type OrNumber<T extends unknown[]> = T;

export abstract class Loadable {
  public static load<I extends Loadable, ARGS extends unknown[]>(
    this: LoadableType<I, ARGS>,
    cache: CacheProvider | Promise<CacheProvider>,
    ...args: OrNumber<ARGS>
  ): Promise<I | undefined>;
  public static load<I extends Loadable, ARGS extends unknown[]>(
    this: LoadableType<I, ARGS>,
    reader: Reader | ArrayBufferView | ArrayBuffer,
    ...args: OrNumber<ARGS>
  ): I;
  public static load<I extends Loadable, ARGS extends unknown[]>(
    this: LoadableType<I, ARGS>,
    reader:
      | Reader
      | ArrayBufferView
      | ArrayBuffer
      | CacheProvider
      | Promise<CacheProvider>,
    ...args: OrNumber<ARGS>
  ): Promise<I | undefined> | I {
    if (reader instanceof ArrayBuffer || ArrayBuffer.isView(reader)) {
      reader = new Reader(reader);
    }
    if (reader instanceof Reader) {
      return this.decode(reader, ...args);
    } else {
      return (async () => {
        const data = await this.loadData(await reader, ...args);
        if (data) {
          return this.decode(data, ...args);
        }
      })();
    }
  }
}

export abstract class PerArchiveLoadable extends Loadable {
  public static async loadData(
    this: { index: number },
    cache: CacheProvider,
    id: number
  ): Promise<Reader | undefined> {
    const archive = await cache.getArchive(this.index, id as number);
    const version = await cache.getVersion(this.index);
    const data = archive?.getFile(0)?.data;
    return data ? new Reader(data, version) : undefined;
  }

  public static async all<I extends PerArchiveLoadable, ID extends number>(
    this: {
      index: number;
      decode(reader: Reader, id: ID): I;
    },
    cache0: CacheProvider | Promise<CacheProvider>
  ): Promise<I[]> {
    const cache = await cache0;
    const ids = await cache.getArchives(this.index);
    if (!ids) {
      return [];
    }

    const archives = await Promise.all(
      ids.map((id) => cache.getArchive(this.index, id))
    );
    const version = await cache.getVersion(this.index);

    return archives
      .filter((v) => v)
      .map((v) => {
        try {
          return this.decode(
            new Reader(v!.getFile(0)!.data, version),
            v!.archive as ID
          );
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const ea = e as any;
            ea.message = v!.archive + ": " + ea.message;
          }
          throw e;
        }
      });
  }
}

export abstract class NamedPerArchiveLoadable extends PerArchiveLoadable {
  public static async loadByName<
    I extends PerArchiveLoadable,
    ID extends number
  >(
    this: {
      index: number;
      decode(reader: Reader, id: ID): I;
    },
    cache0: CacheProvider | Promise<CacheProvider>,
    name: string | number
  ): Promise<I | undefined> {
    const cache = await cache0;
    const ar = await cache.getArchiveByName(this.index, name);
    const version = await cache.getVersion(this.index);
    const data = ar?.getFile(0)?.data;
    if (data) {
      return this.decode(new Reader(data, version), ar!.archive as ID);
    }
  }
}

export class PerFileLoadable extends Loadable {
  public static async loadData(
    this: { index: number; archive: number },
    cache: CacheProvider,
    id: number
  ): Promise<Reader | undefined> {
    const archive = await cache.getArchive(this.index, this.archive);
    const version = await cache.getVersion(this.index);
    const data = archive?.getFile(id)?.data;
    return data ? new Reader(data, version) : undefined;
  }

  public static async all<I extends PerFileLoadable, ID extends number>(
    this: {
      index: number;
      archive: number;
      decode(reader: Reader, id: ID): I;
    },
    cache0: CacheProvider | Promise<CacheProvider>
  ): Promise<I[]> {
    const cache = await cache0;
    const ad = await cache.getArchive(this.index, this.archive);
    if (!ad) {
      return [];
    }

    const version = await cache.getVersion(this.index);

    return [...ad.getFiles().values()]
      .filter((v) => v.data.length > 1 && v.data[0] != 0)
      .map((v) => {
        try {
          return this.decode(new Reader(v.data, version), v.id as ID);
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const ea = e as any;
            ea.message = v.id + ": " + ea.message;
          }
          throw e;
        }
      });
  }
}

export class ArchivePerFileLoadable extends Loadable {
  public static async loadData(
    this: { index: number },
    cache: CacheProvider,
    archiveIdentifier: number,
    id: number
  ): Promise<Reader | undefined> {
    const archive = await cache.getArchive(this.index, archiveIdentifier);
    const version = await cache.getVersion(this.index);
    const data = archive?.getFile(id)?.data;
    return data ? new Reader(data, version) : undefined;
  }

  public static async all<I extends PerFileLoadable, ID extends number>(
    this: {
      index: number;
      decode(reader: Reader, archiveIdentifier: number, id: ID): I;
    },
    cache0: CacheProvider | Promise<CacheProvider>,
    archiveIdentifier: number
  ): Promise<I[]> {
    const cache = await cache0;
    const ad = await cache.getArchive(this.index, archiveIdentifier);
    if (!ad) {
      return [];
    }

    const version = await cache.getVersion(this.index);

    return [...ad.getFiles().values()]
      .filter((v) => v.data.length > 1 && v.data[0] != 0)
      .map((v) => {
        try {
          return this.decode(
            new Reader(v.data, version),
            archiveIdentifier,
            v.id as ID
          );
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const ea = e as any;
            ea.message = v.id + ": " + ea.message;
          }
          throw e;
        }
      });
  }
}
