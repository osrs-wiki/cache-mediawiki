import {
  groupLocationsByProximity,
  groupLocationsByArea,
  mergeLocationGroupsByArea,
  LocationGroup,
} from "./grouping";

import {
  Location,
  Position,
  LocationID,
  LocationType,
  LocationOrientation,
  WorldX,
  WorldY,
} from "@/utils/cache2";

describe("groupLocationsByProximity", () => {
  // Helper function to create a test location
  const createLocation = (x: number, y: number, z = 0, id = 1): Location => {
    return new Location(
      id as LocationID,
      0 as LocationType,
      0 as LocationOrientation,
      new Position(x as WorldX, y as WorldY, z)
    );
  };

  it("should return empty array for empty input", () => {
    const result = groupLocationsByProximity([]);
    expect(result).toEqual([]);
  });

  it("should return single group for single location", () => {
    const location = createLocation(1000, 2000);
    const result = groupLocationsByProximity([location]);
    expect(result).toEqual([[location]]);
  });

  it("should group nearby locations together", () => {
    // Create 3 locations within 10 tiles of each other
    const loc1 = createLocation(1000, 2000);
    const loc2 = createLocation(1005, 2005);
    const loc3 = createLocation(1008, 2003);

    const result = groupLocationsByProximity([loc1, loc2, loc3], 15);

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
    expect(result[0]).toContain(loc1);
    expect(result[0]).toContain(loc2);
    expect(result[0]).toContain(loc3);
  });

  it("should separate distant location groups", () => {
    // Create two clusters: one around (1000,2000) and one around (2000,3000)
    const cluster1 = [
      createLocation(1000, 2000),
      createLocation(1005, 2005),
      createLocation(1010, 2010),
    ];

    const cluster2 = [createLocation(2000, 3000), createLocation(2005, 3005)];

    const allLocations = [...cluster1, ...cluster2];
    const result = groupLocationsByProximity(allLocations, 15);

    expect(result).toHaveLength(2);

    // Each cluster should be grouped together
    const group1 = result.find((g) => g.includes(cluster1[0]));
    const group2 = result.find((g) => g.includes(cluster2[0]));

    expect(group1).toHaveLength(3);
    expect(group2).toHaveLength(2);
  });

  it("should handle locations that cross region boundaries", () => {
    // Locations near a region boundary (regions are 64x64 tiles)
    // Region boundary at x=64*10=640
    const loc1 = createLocation(638, 500); // Just before boundary
    const loc2 = createLocation(642, 500); // Just after boundary (4 tiles away)

    const result = groupLocationsByProximity([loc1, loc2], 15);

    // Should be grouped together despite crossing region boundary
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  it("should respect distance threshold", () => {
    const loc1 = createLocation(1000, 2000);
    const loc2 = createLocation(1020, 2020); // ~28 tiles away
    const loc3 = createLocation(1005, 2005); // ~7 tiles from loc1

    // With threshold 15, loc2 should be in separate group
    const result = groupLocationsByProximity([loc1, loc2, loc3], 15);

    expect(result).toHaveLength(2);

    const group1 = result.find((g) => g.includes(loc1));
    const group2 = result.find((g) => g.includes(loc2));

    expect(group1).toContain(loc3);
    expect(group2).not.toContain(loc1);
    expect(group2).not.toContain(loc3);
  });

  it("should handle transitive grouping with centroid constraints", () => {
    // A chain where A is near B, B is near C, but A is not near C
    const locA = createLocation(1000, 2000);
    const locB = createLocation(1012, 2000); // 12 tiles from A
    const locC = createLocation(1024, 2000); // 12 tiles from B, 24 from A

    const result = groupLocationsByProximity([locA, locB, locC], 15);

    // With centroid-based clustering:
    // A and B group together (centroid at 1006)
    // C at 1024 is 18 tiles from centroid, so it forms separate group
    expect(result).toHaveLength(2);

    const groupWithA = result.find((g) => g.includes(locA));
    expect(groupWithA).toContain(locB);
    expect(groupWithA).not.toContain(locC);
  });

  it("should use centroid-based clustering to prevent chain stretching", () => {
    // Create a chain: A -> B -> C -> D where each is 50 tiles from the next
    // With single-linkage, all would group together (chain of 150 tiles)
    // With centroid-based, the chain should break when far from centroid
    const locA = createLocation(1000, 2000);
    const locB = createLocation(1050, 2000); // 50 tiles from A
    const locC = createLocation(1100, 2000); // 50 tiles from B, 100 from A
    const locD = createLocation(1150, 2000); // 50 tiles from C, 150 from A

    const result = groupLocationsByProximity([locA, locB, locC, locD], 64);

    // With threshold 64 and centroid-based clustering:
    // - A and B should group (distance 50 < 64)
    // - C should NOT join because centroid of (A,B) is at 1025, so C at 1100 is 75 tiles away
    // - C and D should form their own group
    expect(result.length).toBeGreaterThan(1);

    // Verify A and B are together
    const groupWithA = result.find((g) => g.includes(locA));
    expect(groupWithA).toContain(locB);

    // Verify C and D are NOT with A and B
    expect(groupWithA).not.toContain(locC);
    expect(groupWithA).not.toContain(locD);
  });

  it("should handle same coordinates with different planes", () => {
    // Same x,y but different z coordinates
    const loc1 = createLocation(1000, 2000, 0);
    const loc2 = createLocation(1000, 2000, 1);

    const result = groupLocationsByProximity([loc1, loc2], 15);

    // Should be in same group (distance is 0 in x,y plane)
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(2);
  });

  it("should handle large dataset efficiently", () => {
    // Create 100 locations in a grid pattern (10x10 grid with 5 tile spacing)
    const locations: Location[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        locations.push(createLocation(1000 + i * 5, 2000 + j * 5));
      }
    }

    const result = groupLocationsByProximity(locations, 15);

    // With centroid-based clustering and threshold 15:
    // The grid spans 45x45 tiles (9 gaps of 5 tiles each)
    // Centroid-based approach creates multiple compact groups
    expect(result.length).toBeGreaterThan(1);

    // Total locations should still be 100
    const totalLocations = result.reduce((sum, group) => sum + group.length, 0);
    expect(totalLocations).toBe(100);
  });
});

describe("groupLocationsByArea", () => {
  // Helper function to create a test location
  const createLocation = (x: number, y: number, z = 0, id = 1): Location => {
    return new Location(
      id as LocationID,
      0 as LocationType,
      0 as LocationOrientation,
      new Position(x as WorldX, y as WorldY, z)
    );
  };

  it("should map proximity groups to area names", () => {
    const group1 = [
      createLocation(3205, 3205, 0),
      createLocation(3206, 3206, 0),
    ];
    const group2 = [createLocation(3395, 3405, 0)];

    const areaNameMap = new Map<string, string>([
      ["3205,3205,0", "Lumbridge"],
      ["3206,3206,0", "Lumbridge"],
      ["3395,3405,0", "Varrock"],
    ]);

    const result = groupLocationsByArea([group1, group2], areaNameMap);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      areaName: "Lumbridge",
      coordinates: [
        { x: 3205, y: 3205, plane: 0 },
        { x: 3206, y: 3206, plane: 0 },
      ],
    });
    expect(result[1]).toEqual({
      areaName: "Varrock",
      coordinates: [{ x: 3395, y: 3405, plane: 0 }],
    });
  });

  it("should use first location coordinates as lookup key", () => {
    const group = [
      createLocation(1000, 2000, 0),
      createLocation(1005, 2005, 0),
    ];

    const areaNameMap = new Map<string, string>([["1000,2000,0", "Test Area"]]);

    const result = groupLocationsByArea([group], areaNameMap);

    expect(result).toHaveLength(1);
    expect(result[0].areaName).toBe("Test Area");
  });

  it("should use '?' for unknown areas", () => {
    const group = [createLocation(9999, 9999, 0)];

    const areaNameMap = new Map<string, string>();

    const result = groupLocationsByArea([group], areaNameMap);

    expect(result).toHaveLength(1);
    expect(result[0].areaName).toBe("?");
  });

  it("should sort groups alphabetically by area name", () => {
    const group1 = [createLocation(1000, 1000, 0)];
    const group2 = [createLocation(2000, 2000, 0)];
    const group3 = [createLocation(3000, 3000, 0)];

    const areaNameMap = new Map<string, string>([
      ["1000,1000,0", "Zebra Area"],
      ["2000,2000,0", "Alpha Area"],
      ["3000,3000,0", "Midway Area"],
    ]);

    const result = groupLocationsByArea([group1, group2, group3], areaNameMap);

    expect(result).toHaveLength(3);
    expect(result[0].areaName).toBe("Alpha Area");
    expect(result[1].areaName).toBe("Midway Area");
    expect(result[2].areaName).toBe("Zebra Area");
  });

  it("should keep proximity groups separate even if they share the same area", () => {
    // Two separate proximity groups in the same area
    const group1 = [createLocation(1000, 1000, 0)];
    const group2 = [createLocation(2000, 2000, 0)];

    const areaNameMap = new Map<string, string>([
      ["1000,1000,0", "Same Area"],
      ["2000,2000,0", "Same Area"],
    ]);

    const result = groupLocationsByArea([group1, group2], areaNameMap);

    // Should have 2 separate groups even though they're in the same area
    expect(result).toHaveLength(2);
    expect(result[0].areaName).toBe("Same Area");
    expect(result[1].areaName).toBe("Same Area");
    expect(result[0].coordinates).toEqual([{ x: 1000, y: 1000, plane: 0 }]);
    expect(result[1].coordinates).toEqual([{ x: 2000, y: 2000, plane: 0 }]);
  });

  it("should handle different planes correctly", () => {
    const group1 = [createLocation(3205, 3205, 0)];
    const group2 = [createLocation(3205, 3205, 1)];

    const areaNameMap = new Map<string, string>([
      ["3205,3205,0", "Ground Floor"],
      ["3205,3205,1", "Upper Floor"],
    ]);

    const result = groupLocationsByArea([group1, group2], areaNameMap);

    expect(result).toHaveLength(2);
    expect(result[0].areaName).toBe("Ground Floor");
    expect(result[1].areaName).toBe("Upper Floor");
  });

  it("should handle empty input", () => {
    const result = groupLocationsByArea([], new Map());
    expect(result).toEqual([]);
  });
});

describe("mergeLocationGroupsByArea", () => {
  it("should merge groups with identical area names", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Lumbridge",
        coordinates: [{ x: 3205, y: 3205, plane: 0 }],
      },
      {
        areaName: "Lumbridge",
        coordinates: [{ x: 3210, y: 3210, plane: 0 }],
      },
      {
        areaName: "Varrock",
        coordinates: [{ x: 3395, y: 3405, plane: 0 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(2);

    const lumbridge = result.find((g) => g.areaName === "Lumbridge");
    expect(lumbridge).toBeDefined();
    expect(lumbridge!.coordinates).toHaveLength(2);
    expect(lumbridge!.coordinates).toContainEqual({
      x: 3205,
      y: 3205,
      plane: 0,
    });
    expect(lumbridge!.coordinates).toContainEqual({
      x: 3210,
      y: 3210,
      plane: 0,
    });

    const varrock = result.find((g) => g.areaName === "Varrock");
    expect(varrock).toBeDefined();
    expect(varrock!.coordinates).toHaveLength(1);
  });

  it("should preserve alphabetical order from input", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Alpha",
        coordinates: [{ x: 1000, y: 1000, plane: 0 }],
      },
      {
        areaName: "Charlie",
        coordinates: [{ x: 2000, y: 2000, plane: 0 }],
      },
      {
        areaName: "Bravo",
        coordinates: [{ x: 1500, y: 1500, plane: 0 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(3);
    expect(result[0].areaName).toBe("Alpha");
    expect(result[1].areaName).toBe("Charlie");
    expect(result[2].areaName).toBe("Bravo");
  });

  it("should handle multiple merges for the same area", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Test Area",
        coordinates: [{ x: 1000, y: 1000, plane: 0 }],
      },
      {
        areaName: "Test Area",
        coordinates: [{ x: 2000, y: 2000, plane: 0 }],
      },
      {
        areaName: "Test Area",
        coordinates: [{ x: 3000, y: 3000, plane: 0 }],
      },
      {
        areaName: "Test Area",
        coordinates: [{ x: 4000, y: 4000, plane: 0 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(1);
    expect(result[0].areaName).toBe("Test Area");
    expect(result[0].coordinates).toHaveLength(4);
  });

  it("should not mutate original groups", () => {
    const originalGroups: LocationGroup[] = [
      {
        areaName: "Test",
        coordinates: [{ x: 1000, y: 1000, plane: 0 }],
      },
      {
        areaName: "Test",
        coordinates: [{ x: 2000, y: 2000, plane: 0 }],
      },
    ];

    // Make a deep copy to compare later
    const groupsCopy = JSON.parse(JSON.stringify(originalGroups));

    mergeLocationGroupsByArea(originalGroups);

    // Original should be unchanged
    expect(originalGroups).toEqual(groupsCopy);
  });

  it("should handle empty input", () => {
    const result = mergeLocationGroupsByArea([]);
    expect(result).toEqual([]);
  });

  it("should handle single group", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Solo",
        coordinates: [{ x: 1000, y: 1000, plane: 0 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(groups[0]);
  });

  it("should handle groups with no matching names", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Area A",
        coordinates: [{ x: 1000, y: 1000, plane: 0 }],
      },
      {
        areaName: "Area B",
        coordinates: [{ x: 2000, y: 2000, plane: 0 }],
      },
      {
        areaName: "Area C",
        coordinates: [{ x: 3000, y: 3000, plane: 0 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    // Should return the same groups since no names match
    expect(result).toHaveLength(3);
    expect(result).toEqual(groups);
  });

  it("should merge coordinates from multiple groups into single array", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Multi",
        coordinates: [
          { x: 1000, y: 1000, plane: 0 },
          { x: 1001, y: 1001, plane: 0 },
        ],
      },
      {
        areaName: "Multi",
        coordinates: [
          { x: 2000, y: 2000, plane: 0 },
          { x: 2001, y: 2001, plane: 0 },
        ],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(1);
    expect(result[0].coordinates).toHaveLength(4);
    expect(result[0].coordinates).toContainEqual({
      x: 1000,
      y: 1000,
      plane: 0,
    });
    expect(result[0].coordinates).toContainEqual({
      x: 1001,
      y: 1001,
      plane: 0,
    });
    expect(result[0].coordinates).toContainEqual({
      x: 2000,
      y: 2000,
      plane: 0,
    });
    expect(result[0].coordinates).toContainEqual({
      x: 2001,
      y: 2001,
      plane: 0,
    });
  });

  it("should handle groups with different planes", () => {
    const groups: LocationGroup[] = [
      {
        areaName: "Building",
        coordinates: [{ x: 3205, y: 3205, plane: 0 }],
      },
      {
        areaName: "Building",
        coordinates: [{ x: 3205, y: 3205, plane: 1 }],
      },
    ];

    const result = mergeLocationGroupsByArea(groups);

    expect(result).toHaveLength(1);
    expect(result[0].coordinates).toHaveLength(2);
    expect(result[0].coordinates).toContainEqual({
      x: 3205,
      y: 3205,
      plane: 0,
    });
    expect(result[0].coordinates).toContainEqual({
      x: 3205,
      y: 3205,
      plane: 1,
    });
  });
});
