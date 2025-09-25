import { XTEAKeyManager } from "./xtea";
import { hash } from "../Cache";
import { RegionMapper } from "../loaders";

describe("Archive ID to Region ID Conversion", () => {
  beforeEach(() => {
    // Reset RegionMapper for clean tests
    RegionMapper.reset();
  });

  test("should convert archive ID to region ID correctly", () => {
    // Test with region 50, 50 (common test region)
    const x = 50;
    const y = 50;
    const expectedRegionId = (x << 8) | y; // 12850

    // Map archive name for this region
    const mapArchiveName = `m${x}_${y}`; // "m50_50"
    const mapArchiveId = hash(mapArchiveName);

    const regionInfo = RegionMapper.getRegionFromArchiveId(mapArchiveId);

    expect(regionInfo).not.toBeNull();
    expect(regionInfo?.regionId).toBe(expectedRegionId);
    expect(regionInfo?.regionX).toBe(x);
    expect(regionInfo?.regionY).toBe(y);
    expect(regionInfo?.type).toBe("map");
  });

  test("should work with XTEA key flow using region ID", () => {
    const manager = new XTEAKeyManager();

    // Set up test data
    const x = 50;
    const y = 50;
    const regionId = (x << 8) | y; // 12850
    const testKey = [1, 2, 3, 4] as [number, number, number, number];

    // Load XTEA key (this is how OpenRS2 data comes in)
    manager.loadKeys([
      {
        archive: 5,
        group: 1,
        name_hash: -1153413389,
        name: `m${x}_${y}`,
        mapsquare: regionId,
        key: testKey,
      },
    ]);

    // Get archive ID from archive name (this is what the cache provider gets)
    const mapArchiveName = `m${x}_${y}`;
    const archiveId = hash(mapArchiveName);

    // Convert archive ID back to region ID (this is what our fix does)
    const regionInfo = RegionMapper.getRegionFromArchiveId(archiveId);
    expect(regionInfo?.regionId).toBe(regionId);

    // Get XTEA keys for this region (this is how we look up keys)
    const regionKeys = manager.keysByMapSquare.get(regionInfo?.regionId ?? 0);
    expect(regionKeys).toBeDefined();

    // Extract the actual key (this is how we get the key to set on ArchiveData)
    const iterator = regionKeys?.iterator();
    const firstKeyIndex = iterator?.() ?? -1;
    expect(firstKeyIndex).toBeGreaterThanOrEqual(0);

    const extractedKey = [
      regionKeys?.data[firstKeyIndex] ?? 0,
      regionKeys?.data[firstKeyIndex + 1] ?? 0,
      regionKeys?.data[firstKeyIndex + 2] ?? 0,
      regionKeys?.data[firstKeyIndex + 3] ?? 0,
    ];

    expect(extractedKey).toEqual(testKey);
  });

  test("should handle different regions correctly", () => {
    const manager = new XTEAKeyManager();

    // Test multiple regions
    const testData = [
      { x: 50, y: 50, key: [1, 2, 3, 4] as [number, number, number, number] },
      { x: 51, y: 50, key: [5, 6, 7, 8] as [number, number, number, number] },
      {
        x: 50,
        y: 51,
        key: [9, 10, 11, 12] as [number, number, number, number],
      },
    ];

    // Load all keys
    const keyData = testData.map(({ x, y, key }, index) => ({
      archive: 5,
      group: index + 1,
      name_hash: -(1153413389 + index),
      name: `m${x}_${y}`,
      mapsquare: (x << 8) | y,
      key,
    }));
    manager.loadKeys(keyData);

    // Test each region
    for (const { x, y, key } of testData) {
      const archiveName = `m${x}_${y}`;
      const archiveId = hash(archiveName);
      const regionInfo = RegionMapper.getRegionFromArchiveId(archiveId);

      expect(regionInfo).not.toBeNull();

      const regionKeys = manager.keysByMapSquare.get(regionInfo?.regionId ?? 0);
      expect(regionKeys).toBeDefined();

      const iterator = regionKeys?.iterator();
      const firstKeyIndex = iterator?.() ?? -1;
      const extractedKey = [
        regionKeys?.data[firstKeyIndex] ?? 0,
        regionKeys?.data[firstKeyIndex + 1] ?? 0,
        regionKeys?.data[firstKeyIndex + 2] ?? 0,
        regionKeys?.data[firstKeyIndex + 3] ?? 0,
      ];

      expect(extractedKey).toEqual(key);
    }
  });
});
