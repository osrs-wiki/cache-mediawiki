import npcPageBuilder from "./npc";
import Context from "../../../context";

import { NPC, NPCID, Params } from "@/utils/cache2";

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
    it("should handle single NPC correctly (backward compatibility)", () => {
      const guard = createMockNpc("Guard", 1001, 21);
      const builder = npcPageBuilder(guard);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should handle multiple NPCs with shared parameters", () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
      ];

      const builder = npcPageBuilder(guards);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should handle mixed combat and non-combat NPCs by choosing Monster template", () => {
      const npcs = [
        createMockNpc("Guard", 1001, 0), // No combat level
        createMockNpc("Guard", 1002, 21), // Has combat level
      ];

      const builder = npcPageBuilder(npcs);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should use NPC template when all NPCs have no combat level", () => {
      const npcs = [
        createMockNpc("Banker", 2001, 0),
        createMockNpc("Banker", 2002, 0),
      ];

      const builder = npcPageBuilder(npcs);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });

    it("should generate numbered image file names", () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
        createMockNpc("Guard", 1003, 21),
      ];

      const builder = npcPageBuilder(guards);
      const built = builder.build();

      expect(built).toMatchSnapshot();
    });
  });
});
