import areaPageBuilder from "./area";

import Context from "@/context";
import { Area, AreaID, WorldMap } from "@/utils/cache2";
import type { CacheProvider } from "@/utils/cache2";

const BASE_AREA: Area = {
  name: "Test Area",
  id: 1234 as AreaID,
  field3292: [],
  spriteId: -1,
  field3294: -1,
  textColor: 0xffffff,
  category: -1,
  field3298: [null, null, null, null, null],
  field3300: [],
  field3308: "",
  field3309: [],
  textScale: 1,
} as Area;

describe("areaPageBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build area page", async () => {
    const builder = await areaPageBuilder(BASE_AREA);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build area page with context", async () => {
    Context.update = "Test Update";

    const builder = await areaPageBuilder(BASE_AREA);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build area page with map parameter when WorldMap element exists", async () => {
    const mockPosition = {
      getX: jest.fn().mockReturnValue(2664),
      getY: jest.fn().mockReturnValue(3102),
      getZ: jest.fn().mockReturnValue(0),
    };

    const mockElement = {
      areaDefinitionId: 1234,
      getWorldPosition: jest.fn().mockReturnValue(mockPosition),
    };

    const mockWorldMap = {
      getElements: jest.fn().mockReturnValue([mockElement]),
      getComposites: jest.fn().mockReturnValue([]),
      composites: [],
      elements: [mockElement],
    } as unknown as WorldMap;

    jest.spyOn(WorldMap, "load").mockResolvedValue(mockWorldMap);

    const mockCache = Promise.resolve({} as CacheProvider);
    const builder = await areaPageBuilder(BASE_AREA, mockCache);
    expect(builder?.build()).toMatchSnapshot();
  });
});
