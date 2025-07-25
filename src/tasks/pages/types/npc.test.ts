import { writeNpcPage, clearNpcNameMap, getNpcNameMap } from "./npc";

import { NPC, NPCID, Params } from "@/utils/cache2";

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

describe("NPC name mapping", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearNpcNameMap();
  });

  const createMockNpc = (name: string, id: number, combatLevel = 0): NPC => ({
    name,
    id: id as NPCID,
    combatLevel,
    actions: [],
    params: new Params(),
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
    const { writePageToFile } = await import("../pages.utils");
    const { npcPageBuilder } = await import("@/mediawiki/pages/npc");

    const guard1 = createMockNpc("Guard", 1001, 21);
    const guard2 = createMockNpc("Guard", 1002, 21);

    await writeNpcPage(guard1);
    await writeNpcPage(guard2);

    // Should only be called once since both NPCs have the same name
    expect(writePageToFile).toHaveBeenCalledTimes(1);
    expect(npcPageBuilder).toHaveBeenCalledTimes(1);
    
    // Should be called with array of both NPCs
    expect(npcPageBuilder).toHaveBeenCalledWith([guard1, guard2]);
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
});