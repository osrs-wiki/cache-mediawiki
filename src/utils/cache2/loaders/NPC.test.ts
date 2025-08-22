import { NPC } from "./NPC";
import type { CacheProvider } from "../Cache";
import { NPCID } from "../types";

// Mock CacheProvider for testing
const mockCache = Promise.resolve({} as CacheProvider);

// Mock NPC.load static method
jest.mock("./NPC", () => {
  const actualNPC = jest.requireActual("./NPC").NPC;
  return {
    NPC: class MockNPC extends actualNPC {
      static load = jest.fn();
    },
  };
});

describe("NPC", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createMockNPC = (
    id: number,
    name: string,
    multiChildren?: NPCID[]
  ): NPC => {
    const npc = new NPC(id as NPCID);
    npc.name = name;
    npc.multiChildren = multiChildren || [];
    return npc;
  };

  describe("constructor", () => {
    it("should initialize with correct id", () => {
      const npc = new NPC(123 as NPCID);
      expect(npc.id).toBe(123);
    });

    it("should extend MultiChildrenEntity", () => {
      const npc = new NPC(123 as NPCID);
      expect(npc.hasMultiChildren).toBeDefined();
      expect(npc.getMultiChildren).toBeDefined();
      expect(npc.clearMultiChildrenCache).toBeDefined();
    });
  });

  describe("getName()", () => {
    describe("direct name resolution", () => {
      it("should return the name when it is not 'null'", async () => {
        const npc = createMockNPC(1001, "Guard");

        const result = await npc.getName(mockCache);

        expect(result).toBe("Guard");
      });

      it("should return name with special characters", async () => {
        const npc = createMockNPC(1002, "Captain O'Brien");

        const result = await npc.getName(mockCache);

        expect(result).toBe("Captain O'Brien");
      });

      it("should return empty string name", async () => {
        const npc = createMockNPC(1003, "");

        const result = await npc.getName(mockCache);

        expect(result).toBe("");
      });
    });

    describe("multiChildren name resolution", () => {
      it("should return 'null' when name is 'null' and no multiChildren", async () => {
        const npc = createMockNPC(2001, "null");

        const result = await npc.getName(mockCache);

        expect(result).toBe("null");
      });

      it("should return 'null' when name is 'null' and empty multiChildren array", async () => {
        const npc = createMockNPC(2002, "null", []);

        const result = await npc.getName(mockCache);

        expect(result).toBe("null");
      });

      it("should return first child's name when name is 'null' and has multiChildren", async () => {
        const childNpc = createMockNPC(3002, "Child Guard");
        const parentNpc = createMockNPC(3001, "null", [3002 as NPCID]);

        // Mock getMultiChildren to return the child
        parentNpc.getMultiChildren = jest.fn().mockResolvedValue([childNpc]);

        const result = await parentNpc.getName(mockCache);

        expect(result).toBe("Child Guard");
        expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);
      });

      it("should handle recursive name resolution", async () => {
        const childNpc = createMockNPC(4002, "null", [4003 as NPCID]);
        const parentNpc = createMockNPC(4001, "null", [4002 as NPCID]);

        // Mock getMultiChildren for parent
        parentNpc.getMultiChildren = jest.fn().mockResolvedValue([childNpc]);

        // Mock getName for child to recursively call getName on grandchild
        childNpc.getName = jest.fn().mockResolvedValue("Final Guard");

        const result = await parentNpc.getName(mockCache);

        expect(result).toBe("Final Guard");
        expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);
        expect(childNpc.getName).toHaveBeenCalledWith(mockCache);
      });

      it("should return 'null' when multiChildren loading fails", async () => {
        const parentNpc = createMockNPC(5001, "null", [5002 as NPCID]);

        // Mock getMultiChildren to throw an error
        parentNpc.getMultiChildren = jest
          .fn()
          .mockRejectedValue(new Error("Cache error"));

        const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

        const result = await parentNpc.getName(mockCache);

        expect(result).toBe("null");
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to get name from multiChildren for NPC 5001:",
          expect.any(Error)
        );

        consoleSpy.mockRestore();
      });

      it("should return 'null' when multiChildren array is empty after loading", async () => {
        const parentNpc = createMockNPC(6001, "null", [6002 as NPCID]);

        // Mock getMultiChildren to return empty array
        parentNpc.getMultiChildren = jest.fn().mockResolvedValue([]);

        const result = await parentNpc.getName(mockCache);

        expect(result).toBe("null");
        expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);
      });

      it("should use first child when multiple children exist", async () => {
        const firstChild = createMockNPC(7002, "First Guard");
        const secondChild = createMockNPC(7003, "Second Guard");
        const parentNpc = createMockNPC(7001, "null", [
          7002 as NPCID,
          7003 as NPCID,
        ]);

        // Mock getMultiChildren to return multiple children
        parentNpc.getMultiChildren = jest
          .fn()
          .mockResolvedValue([firstChild, secondChild]);

        const result = await parentNpc.getName(mockCache);

        expect(result).toBe("First Guard");
        expect(parentNpc.getMultiChildren).toHaveBeenCalledWith(mockCache);
      });
    });

    describe("edge cases", () => {
      it("should handle case-sensitive 'null' check", async () => {
        const npc = createMockNPC(8001, "NULL"); // uppercase

        const result = await npc.getName(mockCache);

        expect(result).toBe("NULL");
      });

      it("should handle whitespace in 'null' check", async () => {
        const npc = createMockNPC(8002, " null ");

        const result = await npc.getName(mockCache);

        expect(result).toBe(" null ");
      });

      it("should handle deep recursive chain", async () => {
        const level2Npc = createMockNPC(9002, "null", [9003 as NPCID]);
        const level1Npc = createMockNPC(9001, "null", [9002 as NPCID]);

        // Set up the chain
        level1Npc.getMultiChildren = jest.fn().mockResolvedValue([level2Npc]);
        level2Npc.getName = jest.fn().mockResolvedValue("Deep Guard");

        const result = await level1Npc.getName(mockCache);

        expect(result).toBe("Deep Guard");
      });
    });
  });
});
