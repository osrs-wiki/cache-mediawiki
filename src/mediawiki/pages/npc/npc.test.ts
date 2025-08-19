import npcPageBuilder from "./npc";
import Context from "../../../context";

import { NPC, NPCID, Params, CacheProvider } from "@/utils/cache2";

// Mock NPC.load for multiChildren tests
jest.mock("@/utils/cache2", () => ({
  ...jest.requireActual("@/utils/cache2"),
  NPC: {
    ...jest.requireActual("@/utils/cache2").NPC,
    load: jest.fn(),
  },
}));

describe("npcPageBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset context
    Context.updateDate = "2024-03-20";
    Context.update = "Varlamore: Part One";
    Context.beta = false;
    Context.examines = {
      npcs: {
        "1001": "He tries to keep order around here.",
        "1002": "She tries to keep order around here.",
        "1003": "He guards this area.",
      },
    };
  });

  const createMockNpc = (
    name: string,
    id: number,
    combatLevel = 0,
    options: Partial<NPC> = {}
  ): NPC =>
    ({
      name,
      id: id as NPCID,
      combatLevel,
      actions: ["Talk-to", "Trade"],
      params: new Params(),
      size: 1,
      hitpoints: 1,
      attack: 1,
      defence: 1,
      magic: 1,
      ranged: 1,
      chatheadModels: [],
      ...options,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

  it("should build npc infobox without combat level", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build monster infobox with combat level", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 100,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      size: 2,
      hitpoints: 100,
      attack: 200,
      defence: 300,
      magic: 400,
      ranged: 500,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should use beta id when Context.beta is true", async () => {
    const originalBeta = Context.beta;
    Context.beta = true;

    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();

    Context.beta = originalBeta;
  });

  it("should build npc page with transcript", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["Talk-to"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build npc page without chathead when no chatheadModels", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [], // NPC without chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build npc page with chathead when has chatheadModels", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should strip HTML tags from NPC name in page content", async () => {
    const builder = await npcPageBuilder({
      name: "<col=00ffff>Tornado</col>",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  describe("multi-version functionality", () => {
    it("should handle single NPC correctly (backward compatibility)", async () => {
      const guard = createMockNpc("Guard", 1001, 21);
      const builder = await npcPageBuilder(guard);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should handle multiple NPCs with shared parameters", async () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
      ];

      const builder = await npcPageBuilder(guards);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should handle mixed combat and non-combat NPCs by choosing Monster template", async () => {
      const npcs = [
        createMockNpc("Guard", 1001, 0), // No combat level
        createMockNpc("Guard", 1002, 21), // Has combat level
      ];

      const builder = await npcPageBuilder(npcs);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should use NPC template when all NPCs have no combat level", async () => {
      const npcs = [
        createMockNpc("Banker", 2001, 0),
        createMockNpc("Banker", 2002, 0),
      ];

      const builder = await npcPageBuilder(npcs);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should generate numbered image file names", async () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
        createMockNpc("Guard", 1003, 21),
      ];

      const builder = await npcPageBuilder(guards);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should handle multiChildren NPCs with null names", async () => {
      // Mock NPC.load for multiChildren functionality
      const mockLoad = NPC.load as jest.MockedFunction<typeof NPC.load>;
      
      // Parent NPC with null name and multiChildren
      const parentNpc = createMockNpc("null", 5000, 0, {
        multiChildren: [5001 as NPCID, 5002 as NPCID], // References to child NPCs
      });

      // Child NPCs that should be loaded
      const childNpc1 = createMockNpc("Guard", 5001, 21);
      const childNpc2 = createMockNpc("Guard", 5002, 22);

      // Mock the getMultiChildren method on the parent NPC
      parentNpc.getMultiChildren = jest.fn().mockResolvedValue([childNpc1, childNpc2]);

      // Mock the cache and NPC.load behavior (for fallback compatibility)
      const mockCache = Promise.resolve({} as CacheProvider);
      mockLoad.mockImplementation(async (cache, id) => {
        if (id === 5001) return childNpc1;
        if (id === 5002) return childNpc2;
        return null;
      });

      // Test passing single parent NPC with multiChildren
      const builder = await npcPageBuilder(parentNpc, mockCache);
      const built = builder.build();

      expect(built).toMatchSnapshot();
      
      // Verify getMultiChildren was called on the parent
      expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);

      mockLoad.mockRestore();
    });    it("should handle multiChildren NPCs with valid names (not null)", async () => {
      // Mock NPC.load for multiChildren functionality
      const mockLoad = NPC.load as jest.MockedFunction<typeof NPC.load>;

      // Named parent NPC with multiChildren should include itself as first element
      const namedNpcWithMultiChildren = createMockNpc(
        "Captain Guard",
        6000,
        25,
        {
          multiChildren: [6001 as NPCID, 6002 as NPCID],
        }
      );

      // Child NPCs
      const childNpc1 = createMockNpc("Guard Recruit", 6001, 15);
      const childNpc2 = createMockNpc("Guard Veteran", 6002, 30);

      // Mock the getMultiChildren method on the parent NPC
      namedNpcWithMultiChildren.getMultiChildren = jest.fn().mockResolvedValue([childNpc1, childNpc2]);

      // Mock the cache and NPC.load behavior
      const mockCache = Promise.resolve({} as CacheProvider);
      mockLoad.mockImplementation(async (cache, id) => {
        if (id === 6001) return childNpc1;
        if (id === 6002) return childNpc2;
        return null;
      });

      // Should include parent as first element plus children
      const builder = await npcPageBuilder(
        namedNpcWithMultiChildren,
        mockCache
      );
      const built = builder.build();

      expect(built).toMatchSnapshot();

      // Verify getMultiChildren was called on the parent
      expect(namedNpcWithMultiChildren.getMultiChildren).toHaveBeenCalledWith(mockCache);

      mockLoad.mockRestore();
    });

    it("should deduplicate multiChildren NPCs by ID", async () => {
      // Mock NPC.load for multiChildren functionality with duplicate IDs
      const mockLoad = NPC.load as jest.MockedFunction<typeof NPC.load>;
      
      // Parent NPC with null name and multiChildren that will load duplicate IDs
      const parentNpc = createMockNpc("null", 8000, 0, {
        multiChildren: [8001 as NPCID, 8002 as NPCID, 8001 as NPCID], // 8001 appears twice
      });

      // Child NPCs - note that 8001 will be loaded twice but should only appear once
      const childNpc1 = createMockNpc("Guard", 8001, 21);
      const childNpc2 = createMockNpc("Archer", 8002, 25);

      // Mock the getMultiChildren method on the parent NPC (should already be deduplicated)
      parentNpc.getMultiChildren = jest.fn().mockResolvedValue([childNpc1, childNpc2]);

      // Mock the cache and NPC.load behavior
      const mockCache = Promise.resolve({} as CacheProvider);
      mockLoad.mockImplementation(async (cache, id) => {
        if (id === 8001) return childNpc1; // Will be called twice
        if (id === 8002) return childNpc2;
        return null;
      });

      // Test passing single parent NPC with multiChildren
      const builder = await npcPageBuilder(parentNpc, mockCache);
      const built = builder.build();

      expect(built).toMatchSnapshot();
      
      // Verify getMultiChildren was called on the parent (deduplication happens inside getMultiChildren)
      expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);

      mockLoad.mockRestore();
    });

    it("should handle mixed null and valid names by preferring valid name", async () => {
      const npcs = [
        createMockNpc("null", 7000, 0), // NPC with null name
        createMockNpc("Guard", 7001, 21), // NPC with valid name (should be primary)
        createMockNpc("null", 7002, 21), // Another NPC with null name
      ];

      const builder = await npcPageBuilder(npcs);
      const built = builder.build();

      // Should use "Guard" as the primary name
      expect(built).toMatchSnapshot();
    });
  });
});
