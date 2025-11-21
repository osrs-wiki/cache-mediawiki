/* eslint-disable @typescript-eslint/ban-ts-comment */
import sceneryPageBuilder from "./scenery";

import Context from "@/context";
import { CacheProvider, Location, ObjID } from "@/utils/cache2";
import * as locationsModule from "@/utils/locations";

// Mock the locations module
jest.mock("@/utils/locations");

const createMockLocation = (
  id: number,
  x: number,
  y: number,
  z: number
): Location =>
  ({
    getId: () => id,
    getPosition: () => ({
      getX: () => x,
      getY: () => y,
      getZ: () => z,
    }),
  } as Location);

describe("sceneryPageBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("build scenery page", async () => {
    Context.update = "update";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "name",
      actions: ["action1", "action2"],
      id: 1 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();
  });

  it("build scenery page with beta id", async () => {
    const originalBeta = Context.beta;
    Context.beta = true;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "name",
      actions: ["action1", "action2"],
      id: 1 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();

    Context.beta = originalBeta;
  });

  it("should strip HTML tags from scenery name in page content", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "<col=ff0000>Red Chest</col>",
      actions: ["Open", "Search"],
      id: 123 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();
  });

  describe("locations", () => {
    const mockCache = Promise.resolve({} as CacheProvider);

    it("should include map parameter for single location", async () => {
      const mockLocation = createMockLocation(100, 3200, 3400, 0);

      jest
        .spyOn(locationsModule, "getSceneryLocations")
        .mockResolvedValue([mockLocation]);

      jest
        .spyOn(locationsModule, "getAreaNamesForLocations")
        .mockResolvedValue(new Map([["3200,3400,0", "Lumbridge"]]));

      const builder = await sceneryPageBuilder(
        // @ts-ignore Do not require all fields
        {
          name: "Altar",
          actions: ["Pray"],
          id: 100 as ObjID,
        },
        mockCache
      );

      expect(builder?.build()).toMatchSnapshot();
    });

    it("should include locations section for multiple locations", async () => {
      const mockLocations = [
        createMockLocation(100, 3200, 3400, 0),
        createMockLocation(100, 3210, 3410, 0),
        createMockLocation(100, 3100, 3100, 1),
      ];

      jest
        .spyOn(locationsModule, "getSceneryLocations")
        .mockResolvedValue(mockLocations);

      jest
        .spyOn(locationsModule, "groupLocationsByProximity")
        .mockReturnValue([
          [mockLocations[0], mockLocations[1]],
          [mockLocations[2]],
        ]);

      jest.spyOn(locationsModule, "getAreaNamesForLocations").mockResolvedValue(
        new Map([
          ["3200,3400,0", "Test Area"],
          ["3210,3410,0", "Test Area"],
          ["3100,3100,1", "Another Area"],
        ])
      );

      jest.spyOn(locationsModule, "groupLocationsByArea").mockReturnValue([
        {
          areaName: "Another Area",
          coordinates: [{ x: 3100, y: 3100, plane: 1 }],
        },
        {
          areaName: "Test Area",
          coordinates: [
            { x: 3200, y: 3400, plane: 0 },
            { x: 3210, y: 3410, plane: 0 },
          ],
        },
      ]);

      jest.spyOn(locationsModule, "mergeLocationGroupsByArea").mockReturnValue([
        {
          areaName: "Another Area",
          coordinates: [{ x: 3100, y: 3100, plane: 1 }],
        },
        {
          areaName: "Test Area",
          coordinates: [
            { x: 3200, y: 3400, plane: 0 },
            { x: 3210, y: 3410, plane: 0 },
          ],
        },
      ]);

      const builder = await sceneryPageBuilder(
        // @ts-ignore Do not require all fields
        {
          name: "Tree",
          actions: ["Chop down"],
          id: 100 as ObjID,
        },
        mockCache
      );

      const output = builder?.build();
      expect(output).toContain("==Locations==");
      expect(output).toContain("{{ObjectTableHead}}");
      expect(output).toContain("{{ObjectTableBottom}}");
      expect(output).toMatchSnapshot();
    });

    it("should handle no locations gracefully", async () => {
      jest.spyOn(locationsModule, "getSceneryLocations").mockResolvedValue([]);

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      const builder = await sceneryPageBuilder(
        // @ts-ignore Do not require all fields
        {
          name: "Mysterious Object",
          actions: ["Examine"],
          id: 100 as ObjID,
        },
        mockCache
      );

      const output = builder?.build();
      expect(output).not.toContain("==Locations==");
      expect(output).not.toContain("{{Map");
      expect(output).toMatchSnapshot();
    });

    it("should handle cache loading errors gracefully", async () => {
      jest
        .spyOn(locationsModule, "getSceneryLocations")
        .mockRejectedValue(new Error("Cache loading failed"));

      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      const builder = await sceneryPageBuilder(
        // @ts-ignore Do not require all fields
        {
          name: "Broken Cache Object",
          actions: ["Test"],
          id: 100 as ObjID,
        },
        mockCache
      );

      const output = builder?.build();
      expect(output).not.toContain("==Locations==");
      expect(output).not.toContain("{{Map");
      expect(consoleDebugSpy).toHaveBeenCalled();
      expect(output).toMatchSnapshot();

      consoleDebugSpy.mockRestore();
    });

    it("should not attempt to load locations when cache is not provided", async () => {
      const getSceneryLocationsSpy = jest.spyOn(
        locationsModule,
        "getSceneryLocations"
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Do not require all fields
      const builder = await sceneryPageBuilder({
        name: "No Cache Object",
        actions: ["Test"],
        id: 100 as ObjID,
      });

      expect(getSceneryLocationsSpy).not.toHaveBeenCalled();
      expect(builder?.build()).toMatchSnapshot();
    });

    it("should group nearby locations correctly", async () => {
      const mockLocations = [
        createMockLocation(100, 3200, 3400, 0),
        createMockLocation(100, 3201, 3401, 0), // Close to first
        createMockLocation(100, 3300, 3500, 0), // Far from others
      ];

      jest
        .spyOn(locationsModule, "getSceneryLocations")
        .mockResolvedValue(mockLocations);

      // Simulate grouping behavior
      jest.spyOn(locationsModule, "groupLocationsByProximity").mockReturnValue([
        [mockLocations[0], mockLocations[1]], // Grouped together
        [mockLocations[2]], // Separate group
      ]);

      jest.spyOn(locationsModule, "getAreaNamesForLocations").mockResolvedValue(
        new Map([
          ["3200,3400,0", "Test Area"],
          ["3201,3401,0", "Test Area"],
          ["3300,3500,0", "Another Area"],
        ])
      );

      jest.spyOn(locationsModule, "groupLocationsByArea").mockReturnValue([
        {
          areaName: "Another Area",
          coordinates: [{ x: 3300, y: 3500, plane: 0 }],
        },
        {
          areaName: "Test Area",
          coordinates: [
            { x: 3200, y: 3400, plane: 0 },
            { x: 3201, y: 3401, plane: 0 },
          ],
        },
      ]);

      jest.spyOn(locationsModule, "mergeLocationGroupsByArea").mockReturnValue([
        {
          areaName: "Another Area",
          coordinates: [{ x: 3300, y: 3500, plane: 0 }],
        },
        {
          areaName: "Test Area",
          coordinates: [
            { x: 3200, y: 3400, plane: 0 },
            { x: 3201, y: 3401, plane: 0 },
          ],
        },
      ]);

      const builder = await sceneryPageBuilder(
        // @ts-ignore Do not require all fields
        {
          name: "Grouped Scenery",
          actions: ["Use"],
          id: 100 as ObjID,
        },
        mockCache
      );

      expect(locationsModule.groupLocationsByProximity).toHaveBeenCalledWith(
        mockLocations
      );
      expect(builder?.build()).toMatchSnapshot();
    });
  });
});
