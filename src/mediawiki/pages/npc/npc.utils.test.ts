import { groupNpcsByType } from "./npc.utils";

import { NPC, NPCID, Params } from "@/utils/cache2";

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

describe("groupNpcsByType", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should group NPCs by combat and non-combat", () => {
    const npcs = [
      createMockNpc("Servant", 1001, 0),
      createMockNpc("Guard", 1002, 21),
    ];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(2);
    expect(groups[0].type).toBe("npc");
    expect(groups[0].npcs).toHaveLength(1);
    expect(groups[0].npcs[0].name).toBe("Servant");
    expect(groups[0].label).toBe("Servant");

    expect(groups[1].type).toBe("monster");
    expect(groups[1].npcs).toHaveLength(1);
    expect(groups[1].npcs[0].name).toBe("Guard");
    expect(groups[1].label).toBe("In combat");
  });

  it("should handle only combat NPCs", () => {
    const npcs = [
      createMockNpc("Guard", 1001, 21),
      createMockNpc("Warrior", 1002, 30),
    ];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("monster");
    expect(groups[0].npcs).toHaveLength(2);
    expect(groups[0].label).toBe("In combat");
  });

  it("should handle only non-combat NPCs", () => {
    const npcs = [
      createMockNpc("Servant", 1001, 0),
      createMockNpc("Merchant", 1002, 0),
    ];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("npc");
    expect(groups[0].npcs).toHaveLength(2);
    expect(groups[0].label).toBe("Servant");
  });

  it("should handle empty NPC array", () => {
    const npcs: NPC[] = [];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(0);
  });

  it("should use 'NPC' label for null-named NPCs", () => {
    const npcs = [createMockNpc("null", 1001, 0)];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("npc");
    expect(groups[0].label).toBe("NPC");
  });

  it("should strip HTML tags from NPC names in labels", () => {
    const npcs = [createMockNpc("<col=ffff00>Golden Servant</col>", 1001, 0)];
    const groups = groupNpcsByType(npcs);

    expect(groups).toHaveLength(1);
    expect(groups[0].type).toBe("npc");
    expect(groups[0].label).toBe("Golden Servant");
  });
});
