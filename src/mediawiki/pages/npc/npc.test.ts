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
      }
    };
  });

  const createMockNpc = (name: string, id: number, combatLevel = 0, options: Partial<NPC> = {}): NPC => ({
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();

    Context.beta = originalBeta;
  });

  describe("multi-version functionality", () => {
    it("should handle single NPC correctly (backward compatibility)", () => {
      const guard = createMockNpc("Guard", 1001, 21);
      const builder = npcPageBuilder(guard);
      const built = builder.build();

      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|combat = 21");
      expect(built).toContain("|id = 1001");
      
      // Should not have version parameters for single NPC
      expect(built).not.toContain("|version1 =");
    });

    it("should handle multiple NPCs with shared parameters", () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
      ];
      
      const builder = npcPageBuilder(guards);
      const built = builder.build();

      expect(built).toContain("{{Infobox Monster");
      
      // Should have version parameters
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      
      // Shared parameters (same values)
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|combat = 21");
      
      // Different parameters (different IDs and examines)
      expect(built).toContain("|id1 = 1001");
      expect(built).toContain("|id2 = 1002");
      expect(built).toContain("|examine1 = He tries to keep order around here.");
      expect(built).toContain("|examine2 = She tries to keep order around here.");
    });

    it("should handle mixed combat and non-combat NPCs by choosing Monster template", () => {
      const npcs = [
        createMockNpc("Guard", 1001, 0), // No combat level
        createMockNpc("Guard", 1002, 21), // Has combat level
      ];
      
      const builder = npcPageBuilder(npcs);
      const built = builder.build();

      // Should use Monster template because one has combat level
      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|combat1 = 0");
      expect(built).toContain("|combat2 = 21");
    });

    it("should use NPC template when all NPCs have no combat level", () => {
      const npcs = [
        createMockNpc("Banker", 2001, 0),
        createMockNpc("Banker", 2002, 0),
      ];
      
      const builder = npcPageBuilder(npcs);
      const built = builder.build();

      // Should use NPC template because none have combat level
      expect(built).toContain("{{Infobox NPC");
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      expect(built).toContain("|name = Banker");
    });

    it("should generate numbered image file names", () => {
      const guards = [
        createMockNpc("Guard", 1001, 21),
        createMockNpc("Guard", 1002, 21),
        createMockNpc("Guard", 1003, 21),
      ];
      
      const builder = npcPageBuilder(guards);
      const built = builder.build();

      // Check image parameters use numbered naming
      expect(built).toContain("Guard.png"); // First one no number
      expect(built).toContain("Guard (2).png"); // Second one has (2)
      expect(built).toContain("Guard (3).png"); // Third one has (3)
    });
  });
});
