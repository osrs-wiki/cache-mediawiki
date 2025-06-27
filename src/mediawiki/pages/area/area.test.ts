import areaPageBuilder from "./area";

import Context from "@/context";
import { Area, AreaID } from "@/utils/cache2";

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
    Context.updateDate = "2025-01-01";

    const builder = await areaPageBuilder(BASE_AREA);
    expect(builder?.build()).toMatchSnapshot();
  });
});
