import { renderNpcs, clearNpcNameCounts, getNpcNameCounts } from "./npcs";
import { NPC, NPCID, Params } from "@/utils/cache2";
import Context from "@/context";
import * as fs from "fs";

// Mock the fs functions
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

jest.mock("fs/promises", () => ({
  copyFile: jest.fn(),
  mkdir: jest.fn(),
}));

jest.mock("@/utils/files", () => ({
  formatFileName: jest.fn((name: string) => name),
}));

describe("renderNpcs multi-version functionality", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearNpcNameCounts();
    Context.renders = "test-renders";
    (fs.existsSync as jest.Mock).mockReturnValue(true);
  });

  const createMockNpc = (name: string, id: number): NPC => ({
    name,
    id: id as NPCID,
    combatLevel: 21,
    actions: [],
    params: new Params(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  it("should skip NPCs with null names", async () => {
    const { copyFile } = require("fs/promises");
    const nullNpc = createMockNpc("null", 1001);
    
    await renderNpcs(nullNpc);
    
    expect(copyFile).not.toHaveBeenCalled();
  });

  it("should name first occurrence without number", async () => {
    const { copyFile } = require("fs/promises");
    const formatFileName = require("@/utils/files").formatFileName;
    
    const guard = createMockNpc("Guard", 1001);
    await renderNpcs(guard);
    
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/npc/Guard.png");
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/chathead/Guard chathead.png");
  });

  it("should name subsequent occurrences with numbers", async () => {
    const { copyFile } = require("fs/promises");
    const formatFileName = require("@/utils/files").formatFileName;
    
    const guard1 = createMockNpc("Guard", 1001);
    const guard2 = createMockNpc("Guard", 1002);
    const guard3 = createMockNpc("Guard", 1003);
    
    await renderNpcs(guard1);
    await renderNpcs(guard2);
    await renderNpcs(guard3);
    
    // Check the file names used
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/npc/Guard.png");
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/npc/Guard (2).png");
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/npc/Guard (3).png");
    
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/chathead/Guard chathead.png");
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/chathead/Guard (2) chathead.png");
    expect(formatFileName).toHaveBeenCalledWith("./out/test-renders/chathead/Guard (3) chathead.png");
  });

  it("should track name counts correctly", async () => {
    const guard1 = createMockNpc("Guard", 1001);
    const guard2 = createMockNpc("Guard", 1002);
    const farmer = createMockNpc("Farmer", 2001);
    
    await renderNpcs(guard1);
    await renderNpcs(guard2);
    await renderNpcs(farmer);
    
    const counts = getNpcNameCounts();
    expect(counts.get("Guard")).toBe(2);
    expect(counts.get("Farmer")).toBe(1);
  });

  it("should clear name counts", () => {
    const guard = createMockNpc("Guard", 1001);
    renderNpcs(guard);
    
    let counts = getNpcNameCounts();
    expect(counts.size).toBe(1);
    
    clearNpcNameCounts();
    
    counts = getNpcNameCounts();
    expect(counts.size).toBe(0);
  });
});