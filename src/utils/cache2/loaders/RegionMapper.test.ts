import { RegionMapper } from "./RegionMapper";

describe("RegionMapper", () => {
  describe("getRegionFromArchiveId", () => {
    test("should return null for unmapped archive ID", () => {
      const result = RegionMapper.getRegionFromArchiveId(999999);
      expect(result).toBeNull();
    });

    test("should return region info for valid archive ID", () => {
      // Get all known archive IDs
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      if (archiveIds.length > 0) {
        const validArchiveId = archiveIds[0];
        const result = RegionMapper.getRegionFromArchiveId(validArchiveId);

        expect(result).not.toBeNull();
        if (result) {
          expect(result).toHaveProperty("regionX");
          expect(result).toHaveProperty("regionY");
          expect(result).toHaveProperty("regionId");
          expect(result).toHaveProperty("type");
          expect(result).toHaveProperty("archiveName");

          expect(["map", "locations"]).toContain(result.type);
        }
      }
    });

    test("should return consistent results for same archive ID", () => {
      const archiveId = 12345;
      const result1 = RegionMapper.getRegionFromArchiveId(archiveId);
      const result2 = RegionMapper.getRegionFromArchiveId(archiveId);

      expect(result1).toEqual(result2);
    });
  });

  describe("isRegionArchive", () => {
    test("should return false for unmapped archive ID", () => {
      const result = RegionMapper.isRegionArchive(999999);
      expect(result).toBe(false);
    });

    test("should return true for valid region archive ID", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      if (archiveIds.length > 0) {
        const validArchiveId = archiveIds[0];
        const result = RegionMapper.isRegionArchive(validArchiveId);
        expect(result).toBe(true);
      }
    });
  });

  describe("getAllRegionArchiveIds", () => {
    test("should return array of archive IDs", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      expect(Array.isArray(archiveIds)).toBe(true);
      expect(archiveIds.length).toBeGreaterThan(0);

      // Should have entries for 256x256x2 (map + locations) = 131,072 total entries
      // But some might have hash collisions, so we check for a reasonable number
      expect(archiveIds.length).toBeGreaterThan(100000);
      expect(archiveIds.length).toBeLessThanOrEqual(131072);
    });

    test("should return unique archive IDs", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();
      const uniqueIds = [...new Set(archiveIds)];

      expect(uniqueIds.length).toBe(archiveIds.length);
    });
  });

  describe("region coordinate mapping", () => {
    test("should map coordinates correctly", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      if (archiveIds.length > 0) {
        const regionInfo = RegionMapper.getRegionFromArchiveId(archiveIds[0]);

        expect(regionInfo).not.toBeNull();
        if (regionInfo) {
          expect(regionInfo.regionX).toBeGreaterThanOrEqual(0);
          expect(regionInfo.regionX).toBeLessThan(256);
          expect(regionInfo.regionY).toBeGreaterThanOrEqual(0);
          expect(regionInfo.regionY).toBeLessThan(256);

          // Verify region ID is computed correctly
          const expectedRegionId =
            (regionInfo.regionX << 8) | regionInfo.regionY;
          expect(regionInfo.regionId).toBe(expectedRegionId);
        }
      }
    });

    test("should generate archive names correctly", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      if (archiveIds.length > 0) {
        const regionInfo = RegionMapper.getRegionFromArchiveId(archiveIds[0]);

        if (regionInfo) {
          if (regionInfo.type === "map") {
            expect(regionInfo.archiveName).toMatch(/^m\d+_\d+$/);
            expect(regionInfo.archiveName).toBe(
              `m${regionInfo.regionX}_${regionInfo.regionY}`
            );
          } else if (regionInfo.type === "locations") {
            expect(regionInfo.archiveName).toMatch(/^l\d+_\d+$/);
            expect(regionInfo.archiveName).toBe(
              `l${regionInfo.regionX}_${regionInfo.regionY}`
            );
          }
        }
      }
    });
  });

  describe("comprehensive mapping", () => {
    test("should have both map and location types", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();

      if (archiveIds.length > 0) {
        const regionInfos = archiveIds
          .map((id) => RegionMapper.getRegionFromArchiveId(id))
          .filter((info) => info !== null);
        const mapEntries = regionInfos.filter((info) => info?.type === "map");
        const locationEntries = regionInfos.filter(
          (info) => info?.type === "locations"
        );

        expect(mapEntries.length).toBeGreaterThan(0);
        expect(locationEntries.length).toBeGreaterThan(0);
        expect(mapEntries.length + locationEntries.length).toBe(
          regionInfos.length
        );
      }
    });
  });

  describe("getRegionFromUnnamedArchive", () => {
    test("should decode map (file 0) region info from archive ID", () => {
      const archiveId = (25 << 8) | 59; // 6459
      const result = RegionMapper.getRegionFromUnnamedArchive(archiveId, 0);

      expect(result).toEqual({
        regionX: 25,
        regionY: 59,
        regionId: archiveId,
        type: "map",
        archiveName: "m25_59",
      });
    });

    test("should decode locations (file 1) region info from archive ID", () => {
      const archiveId = (25 << 8) | 59; // 6459
      const result = RegionMapper.getRegionFromUnnamedArchive(archiveId, 1);

      expect(result).toEqual({
        regionX: 25,
        regionY: 59,
        regionId: archiveId,
        type: "locations",
        archiveName: "l25_59",
      });
    });

    test("should treat archive ID 0 as a legitimate region (0,0), not missing", () => {
      const result = RegionMapper.getRegionFromUnnamedArchive(0, 0);

      expect(result).toEqual({
        regionX: 0,
        regionY: 0,
        regionId: 0,
        type: "map",
        archiveName: "m0_0",
      });
    });

    test("should return null for file IDs other than 0 or 1", () => {
      const archiveId = (25 << 8) | 59;
      expect(RegionMapper.getRegionFromUnnamedArchive(archiveId, 2)).toBeNull();
      expect(RegionMapper.getRegionFromUnnamedArchive(archiveId, 3)).toBeNull();
      expect(RegionMapper.getRegionFromUnnamedArchive(archiveId, 4)).toBeNull();
      expect(
        RegionMapper.getRegionFromUnnamedArchive(archiveId, -1)
      ).toBeNull();
    });

    test("should return null for out-of-range archive IDs", () => {
      expect(RegionMapper.getRegionFromUnnamedArchive(-1, 0)).toBeNull();
      expect(RegionMapper.getRegionFromUnnamedArchive(0x10000, 0)).toBeNull();
    });

    test("should handle the maximum valid archive ID (region 255,255)", () => {
      const archiveId = 0xffff;
      const result = RegionMapper.getRegionFromUnnamedArchive(archiveId, 1);

      expect(result).toEqual({
        regionX: 255,
        regionY: 255,
        regionId: archiveId,
        type: "locations",
        archiveName: "l255_255",
      });
    });
  });

  describe("getRegionInfo", () => {
    test("should prefer the legacy named-archive lookup when the namehash resolves", () => {
      const archiveIds = RegionMapper.getAllRegionArchiveIds();
      const validNamehash = archiveIds[0];
      const expected = RegionMapper.getRegionFromArchiveId(validNamehash);

      // Pass an archiveId/fileId that would resolve to a completely different
      // region via the unnamed fallback, to prove the named lookup takes priority.
      const result = RegionMapper.getRegionInfo(validNamehash, 9999, 0);

      expect(result).toEqual(expected);
    });

    test("should fall back to the unnamed archive format when the namehash doesn't resolve", () => {
      const archiveId = (25 << 8) | 59;
      const result = RegionMapper.getRegionInfo(0, archiveId, 1);

      expect(result).toEqual({
        regionX: 25,
        regionY: 59,
        regionId: archiveId,
        type: "locations",
        archiveName: "l25_59",
      });
    });

    test("should return null when neither lookup resolves", () => {
      const result = RegionMapper.getRegionInfo(0, -1, 5);

      expect(result).toBeNull();
    });
  });
});
