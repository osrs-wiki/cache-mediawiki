import { XTEAKeyManager } from "./xtea";
import { ArchiveData } from "../Cache";
import { IndexType } from "../types";

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
});
