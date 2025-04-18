import { gunzipSync } from "fflate";

import * as bz2 from "./bz2";
import { Reader } from "./Reader";
import { CompressionType, XTEAKey } from "./types";
import { decryptXTEA, XTEAKeyManager } from "./xtea";

export interface CacheProvider {
  getIndex(index: number): Promise<IndexData | undefined>;
  getArchive(index: number, archive: number): Promise<ArchiveData | undefined>;
  getArchiveByName(
    index: number,
    name: string | number
  ): Promise<ArchiveData | undefined>;
  getArchives(index: number): Promise<number[] | undefined>;
  getVersion(index: number): Promise<CacheVersion>;
  getKeys?(): Promise<XTEAKeyManager>;
}

export interface FileProvider {
  getFile(name: string): Promise<Uint8Array | undefined>;
}

export interface IndexData {
  id: number;
  protocol?: number;
  revision: number;
  compression: number;
  crc: number;
  named: boolean;
  sized: boolean;
}

export class ArchiveFile {
  public data!: Uint8Array;

  public constructor(
    public readonly id: number,
    public readonly namehash: number
  ) {}
}

export class ArchiveData {
  public constructor(
    public readonly index: number,
    public readonly archive: number
  ) {}

  public compressedData!: Uint8Array;
  public namehash!: number;
  public revision!: number;
  public crc!: number;
  public compressedSize!: number;
  public decompressedSize!: number;

  /**@internal*/ files: Map<number, ArchiveFile> = new Map();

  public key: XTEAKey | undefined;

  /**@internal*/ decryptedData: Uint8Array | undefined;

  public maxFile = 0;

  /**@internal*/ addFile(id: number, nameHash: number) {
    this.maxFile = Math.max(id, this.maxFile);
    this.files.set(id, new ArchiveFile(id, nameHash));
  }

  public get compression() {
    return this.compressedData[0] as CompressionType;
  }

  /**@internal*/ getCryptedBlob(): Uint8Array {
    const dv = Reader.makeViewOf(DataView, this.compressedData);
    const cLen = dv.getInt32(1);
    return this.compressedData.subarray(
      5,
      5 + cLen + (this.compression == CompressionType.NONE ? 0 : 4)
    );
  }

  getDecryptedData(): Uint8Array {
    if (this.decryptedData) {
      return this.decryptedData;
    }

    const mode = this.compression;
    let data = this.getCryptedBlob();
    if (this.key) {
      data = decryptXTEA(data, this.key);
    }

    if (mode == CompressionType.NONE) {
      // noop
    } else if (mode == CompressionType.BZ2) {
      const outLen = Reader.makeViewOf(DataView, data).getUint32(0);
      const inData = data.subarray(4);
      data = bz2.decompress(inData, 1, outLen);
    } else if (mode == CompressionType.GZIP) {
      const inData = data.subarray(4);
      data = gunzipSync(inData);
    } else {
      throw new Error(`unsupported compression ${mode}`);
    }

    this.decryptedData = data;

    if (this.files.size == 1) {
      this.files.values().next().value!.data = data;
    } else {
      const fileCount = this.files.size;
      const dv = Reader.makeViewOf(DataView, data);
      const numChunks = dv.getUint8(dv.byteLength - 1);

      let off = dv.byteLength - 1 - numChunks * fileCount * 4;
      let doff = 0;

      if (numChunks == 1) {
        let size = 0;
        for (const file of this.files.values()) {
          size += dv.getInt32(off);
          off += 4;
          file.data = data.subarray(doff, doff + size);
          doff += size;
        }
      } else {
        const sizeStride = numChunks + 1;
        const sizes = new Uint32Array(sizeStride * fileCount);
        for (let ch = 0; ch < numChunks; ch++) {
          let size = 0;
          for (let id = 0; id < fileCount; id++) {
            size += dv.getInt32(off);
            off += 4;
            const soff = id * sizeStride;
            sizes[soff] += size;
            sizes[soff + 1 + ch] = size;
          }
        }

        const fileData: Uint8Array[] = [];
        for (const file of this.files.values()) {
          const soff = fileData.length * sizeStride;
          fileData.push((file.data = new Uint8Array(sizes[soff])));
          sizes[soff] = 0;
        }

        for (let ch = 0; ch < numChunks; ch++) {
          for (let id = 0; id < fileCount; id++) {
            const soff = id * sizeStride;
            const cSize = sizes[soff + 1 + ch];
            const start = sizes[soff];
            fileData[id].set(data.subarray(doff, doff + cSize), start);
            sizes[soff] = start + cSize;
            doff += cSize;
          }
        }
      }
    }

    return data;
  }

  getFile(id: number): ArchiveFile | undefined {
    this.getDecryptedData();
    return this.files.get(id);
  }

  getFiles(): Map<number, ArchiveFile> {
    this.getDecryptedData();
    return this.files;
  }
}

export function hash(name: string | number): number {
  if (typeof name === "number") {
    return name;
  }

  const bytes = new TextEncoder().encode(name);
  let h = 0;
  for (const v of bytes) {
    h = ~~(31 * h + (v & 0xff));
  }
  return h;
}

export interface CacheVersion {
  era: "osrs";
  indexRevision: number;
}
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CacheVersion {
  export function isAfter(
    prev: CacheVersion | undefined,
    after: CacheVersion
  ): boolean {
    if (prev === undefined) {
      return true;
    }
    if (prev.era == after.era) {
      return prev.indexRevision > after.indexRevision;
    }
    return false;
  }
}
