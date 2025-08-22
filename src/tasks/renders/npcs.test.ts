import * as fs from "fs";
import { copyFile } from "fs/promises";

import { renderNpcs, clearNpcNameCounts, getNpcNameCounts } from "./npcs";

import Context from "@/context";
import { CacheProvider, NPC, NPCID, Params } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";

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

  const createMockNpc = (
    name: string,
    id: number,
    multiChildren?: NPCID[]
  ): NPC =>
    ({
      name,
      id: id as NPCID,
      combatLevel: 21,
      actions: [],
      params: new Params(),
      multiChildren: multiChildren || [],
      getMultiChildren: jest.fn().mockResolvedValue([]),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

  it("should skip NPCs with null names", async () => {
    const nullNpc = createMockNpc("null", 1001);

    await renderNpcs(nullNpc);

    expect(copyFile).not.toHaveBeenCalled();
  });

  it("should name first occurrence without number", async () => {
    const guard = createMockNpc("Guard", 1001);
    await renderNpcs(guard);

    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/npc/Guard.png"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/chathead/Guard chathead.png"
    );
  });

  it("should name subsequent occurrences with numbers", async () => {
    const guard1 = createMockNpc("Guard", 1001);
    const guard2 = createMockNpc("Guard", 1002);
    const guard3 = createMockNpc("Guard", 1003);

    await renderNpcs(guard1);
    await renderNpcs(guard2);
    await renderNpcs(guard3);

    // Check the file names used
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/npc/Guard.png"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/npc/Guard (2).png"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/npc/Guard (3).png"
    );

    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/chathead/Guard chathead.png"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/chathead/Guard (2) chathead.png"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/test-renders/chathead/Guard (3) chathead.png"
    );
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

  describe("multiChildren functionality", () => {
    it("should render multiChildren NPCs in multiChildren directory", async () => {
      const parentNpc = createMockNpc("null", 5000, [
        5001 as NPCID,
        5002 as NPCID,
      ]);
      const childNpc1 = createMockNpc("Guard", 5001);
      const childNpc2 = createMockNpc("Archer", 5002);

      // Mock getMultiChildren to return child NPCs
      parentNpc.getMultiChildren = jest
        .fn()
        .mockResolvedValue([childNpc1, childNpc2]);

      const mockCache = Promise.resolve({} as CacheProvider);
      await renderNpcs(parentNpc, mockCache);

      // Should create multiChildren directories
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/multiChildren/Guard.png"
      );
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/multiChildren/Archer.png"
      );
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/chathead/multiChildren/Guard chathead.png"
      );
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/chathead/multiChildren/Archer chathead.png"
      );

      // Verify getMultiChildren was called
      expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);
    });

    it("should render parent NPC with valid name in multiChildren directory", async () => {
      const parentNpc = createMockNpc("Captain", 6000, [6001 as NPCID]);
      const childNpc = createMockNpc("Guard", 6001);

      parentNpc.getMultiChildren = jest.fn().mockResolvedValue([childNpc]);

      const mockCache = Promise.resolve({} as CacheProvider);
      await renderNpcs(parentNpc, mockCache);

      // Should render both parent and child in multiChildren directories
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/multiChildren/Captain.png"
      );
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/multiChildren/Guard.png"
      );
    });

    it("should fall back to standard rendering if multiChildren loading fails", async () => {
      const parentNpc = createMockNpc("Guard", 7000, [7001 as NPCID]);

      // Mock getMultiChildren to throw an error
      parentNpc.getMultiChildren = jest
        .fn()
        .mockRejectedValue(new Error("Cache error"));

      const mockCache = Promise.resolve({} as CacheProvider);
      await renderNpcs(parentNpc, mockCache);

      // Should fall back to standard directory
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/Guard.png"
      );
    });

    it("should render standard NPCs in standard directories when no cache provided", async () => {
      const npc = createMockNpc("Guard", 8000, [8001 as NPCID]);

      await renderNpcs(npc); // No cache parameter

      // Should use standard directories
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/npc/Guard.png"
      );
      expect(formatFileName).toHaveBeenCalledWith(
        "./out/test-renders/chathead/Guard chathead.png"
      );
    });
  });
});
