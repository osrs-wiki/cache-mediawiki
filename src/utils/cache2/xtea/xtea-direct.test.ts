import { gzipSync } from "zlib";

import { XTEAKeyManager } from "./xtea";
import { ArchiveData } from "../Cache";
import { CompressionType, IndexType } from "../types";

/** Builds a compressedData buffer matching ArchiveData's on-disk format for a GZIP-compressed archive. */
const buildGzipArchiveData = (contents: Uint8Array): Uint8Array => {
  const gzipped = gzipSync(contents);
  const buf = new Uint8Array(5 + 4 + gzipped.length);
  const dv = new DataView(buf.buffer);
  dv.setUint8(0, CompressionType.GZIP);
  dv.setInt32(1, gzipped.length);
  dv.setUint32(5, contents.length);
  buf.set(gzipped, 9);
  return buf;
};

describe("XTEA Direct Key Setting", () => {
  it("should properly set and use XTEA keys on ArchiveData", () => {
    // Create an archive with a test key
    const archive = new ArchiveData(IndexType.Maps, 12345);

    // Set the key directly
    archive.key = [1, 2, 3, 4];

    // Verify the key was set
    expect(archive.key).toEqual([1, 2, 3, 4]);
  });

  it("should work with XTEA manager keys", () => {
    const manager = new XTEAKeyManager();

    // Add a key to the manager using the public API
    const testKeys = [
      {
        archive: 5,
        group: 1,
        name_hash: -1153413389,
        name: "test_region",
        mapsquare: 12345,
        key: [1, 2, 3, 4] as [number, number, number, number],
      },
    ];
    manager.loadKeys(testKeys);

    // Check if we can retrieve it
    const keySet = manager.keysByMapSquare.get(12345);
    expect(keySet).toBeDefined();

    if (keySet) {
      const iterator = keySet.iterator();
      const firstKeyIndex = iterator();

      if (firstKeyIndex !== -1) {
        const retrievedKey = [
          keySet.data[firstKeyIndex],
          keySet.data[firstKeyIndex + 1],
          keySet.data[firstKeyIndex + 2],
          keySet.data[firstKeyIndex + 3],
        ];

        expect(retrievedKey).toEqual([1, 2, 3, 4]);
      } else {
        fail("No key found in KeySet");
      }
    }
  });

  describe("tryDecrypt", () => {
    it("decodes unencrypted archives with zero keys loaded, matching current caches with an empty keys.json", () => {
      const manager = new XTEAKeyManager();
      const archive = new ArchiveData(IndexType.Maps, 12345);
      archive.compressedData = buildGzipArchiveData(new Uint8Array([1, 2, 3]));

      const error = manager.tryDecrypt(archive, 12345);

      expect(error).toBeUndefined();
      expect(archive.key).toBeUndefined();
      expect(archive.getDecryptedData()).toEqual(new Uint8Array([1, 2, 3]));
    });

    it("returns an error for genuinely encrypted archives with no matching key", () => {
      const manager = new XTEAKeyManager();
      // Garbage bytes with no valid GZIP header - simulates data that's actually encrypted
      // and can't be decompressed without the (unavailable) key.
      const undecodable = new ArchiveData(IndexType.Maps, 12345);
      undecodable.compressedData = buildGzipArchiveData(
        new Uint8Array([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff])
      );
      undecodable.compressedData[9] = 0x00; // corrupt the GZIP magic bytes

      const error = manager.tryDecrypt(undecodable, 12345);

      expect(error).toBeInstanceOf(Error);
    });
  });
});
