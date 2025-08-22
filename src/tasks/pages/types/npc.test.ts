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
    expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith(
      [guard1, guard2],
      undefined
    );
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
      expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith(
        parentNpc,
        mockCache
      );

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
      expect(jest.mocked(npcPageBuilder)).toHaveBeenCalledWith(
        parentNpc,
        mockCache
      );

      mockLoad.mockRestore();
    });
  });

  describe("getName() integration", () => {
    const mockCache = Promise.resolve({} as CacheProvider);

    it("should use getName() for multiChildren NPCs with null names", async () => {
      const npc = createMockNpc("null", 5001, 0, [5002]);

      // Mock getName to return a clean name
      npc.getName = jest.fn().mockResolvedValue("Clean Name");

      await writeNpcPage(npc, mockCache);

      expect(npc.getName).toHaveBeenCalledWith(mockCache);
      expect(writePageToFile).toHaveBeenCalledWith(
        expect.anything(),
        "npc",
        "Clean Name",
        "5001",
        true // isMultiChildrenDir should be true for null-named NPCs
      );
    });

    it("should use getName() for multiChildren NPCs with valid names", async () => {
      const npc = createMockNpc("Valid Name", 6001, 0, [6002]);

      // Mock getName to return the same name (since it's already valid)
      npc.getName = jest.fn().mockResolvedValue("Valid Name");

      await writeNpcPage(npc, mockCache);

      expect(npc.getName).toHaveBeenCalledWith(mockCache);
      expect(writePageToFile).toHaveBeenCalledWith(
        expect.anything(),
        "npc",
        "Valid Name",
        "6001",
        false // isMultiChildrenDir should be false for named NPCs
      );
    });

    it("should handle getName() failures gracefully", async () => {
      const npc = createMockNpc("null", 7001, 0, [7002]);

      // Mock getName to fail
      npc.getName = jest.fn().mockRejectedValue(new Error("getName failed"));

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await writeNpcPage(npc, mockCache);

      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to get name for NPC 7001, using fallback:",
        expect.any(Error)
      );
      expect(writePageToFile).toHaveBeenCalledWith(
        expect.anything(),
        "npc",
        "Unknown NPC 7001",
        "7001",
        true
      );

      consoleSpy.mockRestore();
    });

    it("should fall back to direct name when no cache provided", async () => {
      const npc = createMockNpc("Direct Name", 8001, 0, [8002]);

      await writeNpcPage(npc); // No cache provided

      expect(writePageToFile).toHaveBeenCalledWith(
        expect.anything(),
        "npc",
        "Direct Name",
        "8001",
        false
      );
    });

    it("should fall back to Unknown NPC when no cache and null name", async () => {
      const npc = createMockNpc("null", 9001, 0, [9002]);

      await writeNpcPage(npc); // No cache provided

      expect(writePageToFile).toHaveBeenCalledWith(
        expect.anything(),
        "npc",
        "Unknown NPC 9001",
        "9001",
        true
      );
    });
  });
});
