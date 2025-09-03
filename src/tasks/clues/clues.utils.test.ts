// Import the function we want to test directly without mocking modules
import { getChallenge } from "./clues.utils";

import type { CacheProvider } from "@/utils/cache2";

describe("clues utils", () => {
  let mockCache: Promise<CacheProvider>;

  beforeEach(() => {
    mockCache = Promise.resolve({} as CacheProvider);
  });

  describe("getChallenge", () => {
    // Test the types and public interface
    it("should be imported successfully", async () => {
      expect(typeof getChallenge).toBe("function");
    });

    it("should return empty array when no challengeIds provided", async () => {
      const result = await getChallenge(mockCache, []);
      expect(result).toEqual([]);
    });

    it("should return empty array when challengeIds is undefined", async () => {
      const result = await getChallenge(mockCache, undefined);
      expect(result).toEqual([]);
    });
  });
});