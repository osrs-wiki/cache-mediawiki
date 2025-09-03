// Import the function we want to test directly without mocking modules
import { getChallenges } from "./clues.utils";

import type { CacheProvider } from "@/utils/cache2";

describe("clues utils", () => {
  let mockCache: Promise<CacheProvider>;

  beforeEach(() => {
    mockCache = Promise.resolve({} as CacheProvider);
  });

  describe("getChallenges", () => {
    // Test the types and public interface
    it("should be imported successfully", async () => {
      expect(typeof getChallenges).toBe("function");
    });

    it("should return empty array when no challengeIds provided", async () => {
      const result = await getChallenges(mockCache, []);
      expect(result).toEqual([]);
    });

    it("should return empty array when challengeIds is undefined", async () => {
      const result = await getChallenges(mockCache, undefined);
      expect(result).toEqual([]);
    });
  });
});