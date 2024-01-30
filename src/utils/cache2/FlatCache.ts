import {
  ArchiveData,
  CacheProvider,
  CacheVersion,
  FileProvider,
  hash,
  IndexData,
} from "./Cache";

export class FlatIndexData implements IndexData {
  public revision!: number;
  public compression!: number;
  public crc!: number;
  public named!: boolean;

  /**@internal*/ archives: Map<number, ArchiveData> = new Map();
  private constructor(public id: number) {}

  static async of(indexID: number, data: Uint8Array): Promise<FlatIndexData> {
    const LF = 0x0a;
    const EQ = 0x3d;
    const fid = new FlatIndexData(indexID);
    const td = new TextDecoder();
    let ar: ArchiveData | undefined;
    for (let i = 0; i < data.length; i++) {
      let eol = data.indexOf(LF, i);
      if (eol == -1) {
        eol = data.length;
      }
      const line = data.subarray(i, eol);
      i = eol;

      const kvs = line.indexOf(EQ);
      if (kvs == -1) {
        continue;
      }
      const key = td.decode(line.subarray(0, kvs));
      const value = td.decode(line.subarray(kvs + 1));

      if (key === "id") {
        fid.archives.set(~~value, (ar = new ArchiveData(indexID, ~~value)));
        continue;
      }

      if (!ar) {
        switch (key) {
          case "named":
            fid.named = value == "true";
            break;
          case "revision":
          case "compression":
          case "crc":
            fid[key] = ~~value;
            break;
        }
      } else {
        switch (key) {
          case "contents": {
            const res = await fetch(
              "data:application/octet-binary;base64," + value
            );
            const data = await res.arrayBuffer();
            ar!.compressedData = new Uint8Array(data);
            break;
          }
          case "file": {
            const [id, hash] = value.split("=");
            ar!.addFile(~~id, ~~hash);
            break;
          }
          case "namehash":
          case "revision":
          case "crc":
          case "compression":
            ar[key] = ~~value;
            break;
        }
      }
    }
    return fid;
  }

  getArchive(archive: number): ArchiveData | undefined {
    return this.archives.get(archive);
  }

  getArchiveByName(name: string | number): ArchiveData | undefined {
    const namehash = hash(name);
    for (const ar of this.archives.values()) {
      if (ar.namehash == namehash) {
        return ar;
      }
    }
  }
}

export class FlatCacheProvider implements CacheProvider {
  private indexes: Map<number, Promise<FlatIndexData | undefined>> = new Map();

  constructor(private disk: FileProvider) {}

  public async getIndex(index: number): Promise<FlatIndexData | undefined> {
    let idxp = this.indexes.get(index);
    if (!idxp) {
      this.indexes.set(
        index,
        (idxp = this.disk
          .getFile(index + ".flatcache")
          .then((data) => data && FlatIndexData.of(index, data)))
      );
    }
    return idxp;
  }

  public async getArchive(
    index: number,
    archive: number
  ): Promise<ArchiveData | undefined> {
    const idx = await this.getIndex(index);
    return idx?.getArchive(archive);
  }

  public async getArchives(index: number): Promise<number[] | undefined> {
    const idx = await this.getIndex(index);
    if (!idx) {
      return;
    }

    return Array.from(idx.archives.keys());
  }

  public async getArchiveByName(
    index: number,
    name: string | number
  ): Promise<ArchiveData | undefined> {
    const idx = await this.getIndex(index);
    return idx?.getArchiveByName(name);
  }

  public async getVersion(index: number): Promise<CacheVersion> {
    return {
      era: "osrs",
      indexRevision: (await this.getIndex(index))?.revision ?? 0,
    };
  }
}
