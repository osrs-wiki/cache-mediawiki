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

export abstract class PerArchiveParentLoadable extends Loadable {
  public children?: this[] = [];

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

  public static async loadDataWithChildren<
    I extends PerArchiveParentLoadable,
    ID extends number
  >(
    this: {
      index: number;
      decode(reader: Reader, id: ID): I;
      loadDataWithChildren(
        cache: CacheProvider,
        archiveId: number
      ): Promise<{ parent: I; children: I[] } | undefined>;
      getId(archiveId: number, fileId: number): ID;
    },
    cache: CacheProvider,
    archiveId: number
  ): Promise<{ parent: I; children: I[] } | undefined> {
    const archive = await cache.getArchive(this.index, archiveId);
    if (!archive) {
      return undefined;
    }

    const version = await cache.getVersion(this.index);
    const files = [...archive.getFiles().values()];

    if (files.length === 0) {
      return undefined;
    }

    // Sort files by ID to ensure consistent ordering
    files.sort((a, b) => a.id - b.id);

    const items: I[] = [];
    let parent: I | undefined;

    for (const file of files) {
      if (file.data.length <= 1 || file.data[0] === 0) {
        continue;
      }

      try {
        const itemId = this.getId(archiveId, file.id);
        const item = this.decode(new Reader(file.data, version), itemId);
        items.push(item);

        // The parent is typically the item with file ID 0
        if (file.id === 0) {
          parent = item;
        }
      } catch (e) {
        if (typeof e === "object" && e && "message" in e) {
          const errorWithMessage = e as { message: string };
          errorWithMessage.message = file.id + ": " + errorWithMessage.message;
        }
        throw e;
      }
    }

    // If no file ID 0 exists, use the first item as parent
    if (!parent && items.length > 0) {
      parent = items[0];
    }

    if (!parent) {
      return undefined;
    }

    // Children are all items except the parent
    const children = items.filter((item) => item !== parent);

    return { parent, children };
  }

  public static async all<
    I extends PerArchiveParentLoadable,
    ID extends number
  >(
    this: {
      index: number;
      decode(reader: Reader, id: ID): I;
      loadDataWithChildren(
        cache: CacheProvider,
        archiveId: number
      ): Promise<{ parent: I; children: I[] } | undefined>;
    },
    cache0: CacheProvider | Promise<CacheProvider>
  ): Promise<I[]> {
    const cache = await cache0;
    const ids = await cache.getArchives(this.index);
    if (!ids) {
      return [];
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await this.loadDataWithChildren(cache, id);
          if (result) {
            // Populate the parent's children array
            result.parent.children = result.children;
            return result.parent;
          }
          return null;
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const errorWithMessage = e as { message: string };
            errorWithMessage.message = id + ": " + errorWithMessage.message;
          }
          throw e;
        }
      })
    );

    return results.filter((result) => result !== null) as I[];
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
            const errorWithMessage = e as { message: string };
            errorWithMessage.message = v.id + ": " + errorWithMessage.message;
          }
          throw e;
        }
      });
  }
}
