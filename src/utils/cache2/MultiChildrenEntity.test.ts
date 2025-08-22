import type { CacheProvider } from "./Cache";
import { MultiChildrenEntity } from "./MultiChildrenEntity";

// Mock CacheProvider for testing
const mockCache = Promise.resolve({} as CacheProvider);

// Concrete implementation for testing the abstract class
class TestEntity extends MultiChildrenEntity<TestEntity, number> {
  public name: string;
  public multiChildren?: number[] = [];

  constructor(id: number, name = `Entity ${id}`, multiChildren?: number[]) {
    super(id);
    this.name = name;
    this.multiChildren = multiChildren;
  }

  public async loadChild(
    cache: Promise<CacheProvider>,
    childId: number
  ): Promise<TestEntity | null> {
    // Mock implementation that simulates loading entities
    if (childId === 999) {
      // Simulate a loading failure
      throw new Error(`Failed to load entity ${childId}`);
    }
    if (childId <= 0) {
      // Invalid IDs return null
      return null;
    }
    if (childId === 404) {
      // Simulate entity not found
      return null;
    }
    return new TestEntity(childId, `Child ${childId}`);
  }
}

describe("MultiChildrenEntity", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should initialize with correct id", () => {
      const entity = new TestEntity(123, "Test");
      expect(entity.id).toBe(123);
    });
  });

  describe("hasMultiChildren", () => {
    it("should return false when multiChildren is undefined", () => {
      const entity = new TestEntity(1, "Test");
      entity.multiChildren = undefined;
      expect(entity.hasMultiChildren()).toBe(false);
    });

    it("should return false when multiChildren is empty array", () => {
      const entity = new TestEntity(1, "Test", []);
      expect(entity.hasMultiChildren()).toBe(false);
    });

    it("should return true when multiChildren has items", () => {
      const entity = new TestEntity(1, "Test", [2, 3, 4]);
      expect(entity.hasMultiChildren()).toBe(true);
    });
  });

  describe("getMultiChildren", () => {
    it("should return empty array when multiChildren is undefined", async () => {
      const entity = new TestEntity(1, "Test");
      entity.multiChildren = undefined;

      const result = await entity.getMultiChildren(mockCache);
      expect(result).toEqual([]);
    });

    it("should return empty array when multiChildren is empty", async () => {
      const entity = new TestEntity(1, "Test", []);

      const result = await entity.getMultiChildren(mockCache);
      expect(result).toEqual([]);
    });

    it("should load and return valid children", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20, 30]);

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(10);
      expect(result[0].name).toBe("Child 10");
      expect(result[1].id).toBe(20);
      expect(result[1].name).toBe("Child 20");
      expect(result[2].id).toBe(30);
      expect(result[2].name).toBe("Child 30");
    });

    it("should deduplicate child IDs before loading", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20, 10, 30, 20]);

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.id).sort()).toEqual([10, 20, 30]);
    });

    it("should filter out invalid IDs (≤ 0)", async () => {
      const entity = new TestEntity(1, "Parent", [-1, 0, 10, 20, -5]);

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[1].id).toBe(20);
    });

    it("should handle child loading failures gracefully", async () => {
      const entity = new TestEntity(1, "Parent", [10, 999, 20]); // 999 will fail to load

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[1].id).toBe(20);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load child entity 999 for parent 1:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle child entities that return null", async () => {
      const entity = new TestEntity(1, "Parent", [10, 404, 20]); // 404 will return null

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(10);
      expect(result[1].id).toBe(20);
    });

    it("should cache results on first call", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20]);
      const loadChildSpy = jest.spyOn(entity, "loadChild");

      // First call should load children
      const result1 = await entity.getMultiChildren(mockCache);
      expect(result1).toHaveLength(2);
      expect(loadChildSpy).toHaveBeenCalledTimes(2);

      // Second call should use cache
      const result2 = await entity.getMultiChildren(mockCache);
      expect(result2).toHaveLength(2);
      expect(result2).toBe(result1); // Same reference, proving it's cached
      expect(loadChildSpy).toHaveBeenCalledTimes(2); // No additional calls

      loadChildSpy.mockRestore();
    });

    it("should handle general loading errors", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20]);
      entity.multiChildren = [10, 20]; // Ensure multiChildren is set

      // Mock loadChild to throw an error during the main try block
      const originalLoadChild = entity.loadChild;
      entity.loadChild = jest
        .fn()
        .mockRejectedValue(new Error("General loading error"));

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toEqual([]);
      // Individual child loading errors are handled separately
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load child entity 10 for parent 1:",
        expect.any(Error)
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load child entity 20 for parent 1:",
        expect.any(Error)
      );

      // Restore original method and clean up
      entity.loadChild = originalLoadChild;
      consoleSpy.mockRestore();
    });
  });

  describe("getCachedMultiChildren", () => {
    it("should return undefined when not cached", () => {
      const entity = new TestEntity(1, "Test", [10, 20]);
      expect(entity.getCachedMultiChildren()).toBeUndefined();
    });

    it("should return cached result after getMultiChildren is called", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20]);

      expect(entity.getCachedMultiChildren()).toBeUndefined();

      const result = await entity.getMultiChildren(mockCache);
      const cached = entity.getCachedMultiChildren();

      expect(cached).toBeDefined();
      expect(cached).toBe(result);
      expect(cached).toHaveLength(2);
    });

    it("should return empty array when cached empty result", async () => {
      const entity = new TestEntity(1, "Parent", []);

      await entity.getMultiChildren(mockCache);
      const cached = entity.getCachedMultiChildren();

      expect(cached).toEqual([]);
    });
  });

  describe("clearMultiChildrenCache", () => {
    it("should clear cached results", async () => {
      const entity = new TestEntity(1, "Parent", [10, 20]);
      const loadChildSpy = jest.spyOn(entity, "loadChild");

      // Load and cache children
      await entity.getMultiChildren(mockCache);
      expect(entity.getCachedMultiChildren()).toBeDefined();
      expect(loadChildSpy).toHaveBeenCalledTimes(2);

      // Clear cache
      entity.clearMultiChildrenCache();
      expect(entity.getCachedMultiChildren()).toBeUndefined();

      // Next call should reload
      await entity.getMultiChildren(mockCache);
      expect(loadChildSpy).toHaveBeenCalledTimes(4); // 2 more calls

      loadChildSpy.mockRestore();
    });
  });

  describe("edge cases", () => {
    it("should handle mix of valid, invalid, and failing IDs", async () => {
      const entity = new TestEntity(1, "Parent", [-1, 0, 10, 999, 404, 20, 30]);

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(3); // Only 10, 20, 30 should succeed
      expect(result.map((r) => r.id).sort()).toEqual([10, 20, 30]);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Failed to load child entity 999 for parent 1:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it("should handle all children failing to load", async () => {
      const entity = new TestEntity(1, "Parent", [999, 999, 999]); // All will fail

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalledTimes(1); // Only one call due to deduplication

      consoleSpy.mockRestore();
    });

    it("should handle large multiChildren arrays efficiently", async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => i + 1);
      const entity = new TestEntity(1, "Parent", largeArray);

      const result = await entity.getMultiChildren(mockCache);

      expect(result).toHaveLength(100);
      expect(result[0].id).toBe(1);
      expect(result[99].id).toBe(100);
    });
  });
});
