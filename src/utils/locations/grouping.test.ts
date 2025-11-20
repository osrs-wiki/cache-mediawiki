import { groupLocationsByProximity } from "./grouping";

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

  it("should handle transitive grouping", () => {
    // A chain where A is near B, B is near C, but A is not near C
    const locA = createLocation(1000, 2000);
    const locB = createLocation(1012, 2000); // 12 tiles from A
    const locC = createLocation(1024, 2000); // 12 tiles from B, 24 from A

    const result = groupLocationsByProximity([locA, locB, locC], 15);

    // All should be in same group due to transitive proximity
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(3);
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
    // Create 100 locations in a grid pattern
    const locations: Location[] = [];
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        locations.push(createLocation(1000 + i * 5, 2000 + j * 5));
      }
    }

    const result = groupLocationsByProximity(locations, 15);

    // All should be in one group since they're all within 15 tiles
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(100);
  });
});
