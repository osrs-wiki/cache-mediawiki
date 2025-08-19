import {
  writeNpcPage,
  clearNpcNameMap,
  getNpcNameMap,
  writeNpcPageFromCache,
} from "./npc";
import { writePageToFile } from "../pages.utils";

import { npcPageBuilder } from "@/mediawiki/pages/npc";
import { NPC, NPCID, Params, CacheProvider } from "@/utils/cache2";


// Mock the dependencies
jest.mock("../../renders", () => ({
  renderNpcs: jest.fn(),
}));

jest.mock("../pages.utils", () => ({
  writePageToFile: jest.fn(),
}));

jest.mock("@/mediawiki/pages/npc", () => ({
  npcPageBuilder: jest.fn().mockReturnValue({ build: jest.fn() }),
}));

jest.mock("@/context", () => ({
  renders: null as string | undefined,
}));

// Mock the NPC.load method
jest.mock("@/utils/cache2", () => ({
  ...jest.requireActual("@/utils/cache2"),
  NPC: {
    ...jest.requireActual("@/utils/cache2").NPC,
    load: jest.fn(),
  },
}));

describe("NPC name mapping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearNpcNameMap();
  });

  const createMockNpc = (
    name: string,
    id: number,
    combatLevel = 0,
    multiChildren: number[] = []
  ): NPC =>
    ({
      name,
      id: id as NPCID,
      combatLevel,
      actions: [],
      params: new Params(),
      multiChildren: multiChildren as NPCID[],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

  it("should group NPCs by name in the name map", async () => {
    const guard1 = createMockNpc("Guard", 1001, 21);
    const guard2 = createMockNpc("Guard", 1002, 21);
    const farmer = createMockNpc("Farmer", 2001, 7);

    // Process first Guard
    await writeNpcPage(guard1);

    let nameMap = getNpcNameMap();
    expect(nameMap.get("Guard")).toHaveLength(1);
    expect(nameMap.get("Guard")?.[0]).toEqual(guard1);

    // Process second Guard - should not write page again but should be in the map
    await writeNpcPage(guard2);

    nameMap = getNpcNameMap();
    expect(nameMap.get("Guard")).toHaveLength(2);
    expect(nameMap.get("Guard")?.[1]).toEqual(guard2);

    // Process farmer
    await writeNpcPage(farmer);

    nameMap = getNpcNameMap();
    expect(nameMap.get("Guard")).toHaveLength(2);
    expect(nameMap.get("Farmer")).toHaveLength(1);
    expect(nameMap.get("Farmer")?.[0]).toEqual(farmer);
  });

  it("should only write page once per name", async () => {
    const guard1 = createMockNpc("Guard", 1001, 21);
    const guard2 = createMockNpc("Guard", 1002, 21);

    await writeNpcPage(guard1);
    await writeNpcPage(guard2);

    // Should only be called once since both NPCs have the same name
    expect(jest.mocked(writePageToFile)).toHaveBeenCalledTimes(1);
    expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledTimes(1);

    // Should be called with array of both NPCs and undefined cache
    expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith([guard1, guard2], undefined);
  });

  it("should clear name map and processed NPCs", () => {
    const guard1 = createMockNpc("Guard", 1001, 21);
    writeNpcPage(guard1);

    let nameMap = getNpcNameMap();
    expect(nameMap.size).toBe(1);

    clearNpcNameMap();

    nameMap = getNpcNameMap();
    expect(nameMap.size).toBe(0);
  });

  describe("multiChildren functionality", () => {
    it("should handle NPCs with multiChildren array", async () => {
      // Mock NPC.load to return the correct NPC for the parent and children
      const mockLoad = NPC.load as jest.MockedFunction<typeof NPC.load>;

      const parentNpc = createMockNpc("null", 5000, 0, [5001, 5002]);
      const childNpc1 = createMockNpc("Guard", 5001, 21);
      const childNpc2 = createMockNpc("Guard", 5002, 21);

      mockLoad.mockImplementation(async (cache, id) => {
        if (id === 5000) return parentNpc;
        if (id === 5001) return childNpc1;
        if (id === 5002) return childNpc2;
        return null;
      });

      const mockCache = Promise.resolve({} as CacheProvider);

      await writeNpcPageFromCache(mockCache, 5000);

      // Should call writePageToFile with clean name for multiChildren NPCs
      expect(jest.mocked(writePageToFile)).toHaveBeenCalledTimes(1);
      expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith(parentNpc, mockCache);

      mockLoad.mockRestore();
    });

    it("should handle NPCs with invalid multiChildren IDs", async () => {
      const mockLoad = NPC.load as jest.MockedFunction<typeof NPC.load>;

      const parentNpc = createMockNpc("null", 6000, 0, [6001, -1, 0]);
      const validChildNpc = createMockNpc("Guard", 6001, 21);

      mockLoad.mockImplementation(async (cache, id) => {
        if (id === 6000) return parentNpc;
        if (id === 6001) return validChildNpc;
        return null;
      });

      const mockCache = Promise.resolve({} as CacheProvider);

      await writeNpcPageFromCache(mockCache, 6000);

      // Should still process with only valid children
      expect(jest.mocked(writePageToFile)).toHaveBeenCalledTimes(1);
      expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith(parentNpc, mockCache);

      mockLoad.mockRestore();
    });
  });
});
