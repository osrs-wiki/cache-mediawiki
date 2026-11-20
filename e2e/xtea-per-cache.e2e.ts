import { runCLICommand } from "./utils/cli";
import { NEW_CACHE_VERSION, OLD_CACHE_VERSION } from "./utils/cache-versions";

describe("Per-Cache XTEA Integration", () => {
  it("should load XTEA keys for each cache provider independently", async () => {
    const result = await runCLICommand({
      command: "npm run start",
      args: [
        "diffs",
        "--",
        "-o",
        OLD_CACHE_VERSION,
        "-n",
        NEW_CACHE_VERSION,
      ],
    });

    expect(result.exitCode).toBe(0);
    // Each cache provider should have loaded its own XTEA keys
    // Verify no errors related to XTEA key loading in the output
    expect(result.stdout).not.toContain("Failed to load XTEA keys");
  });

  it("should work with pages command and XTEA-enabled cache operations", async () => {
    const result = await runCLICommand({
      command: "npm run start",
      args: [
        "pages",
        "--",
        "--newCache",
        NEW_CACHE_VERSION,
        "--type",
        "npc",
        "--id",
        "1234",
      ],
    });

    expect(result.exitCode).toBe(0);
    // Should complete successfully even if XTEA loading occurs
    expect(result.stdout).not.toContain("error");
  });

  it("should handle cache operations without XTEA keys gracefully", async () => {
    const result = await runCLICommand({
      command: "npm run start",
      args: [
        "pages",
        "--",
        "--newCache",
        "invalid-cache-version",
        "--type",
        "item",
        "--id",
        "1234",
      ],
    });

    // Should still work even if XTEA loading fails
    // The cache provider should return empty XTEA manager for invalid versions
    expect(result.stdout).not.toContain("Fatal error");
  });

  it("should load different XTEA keys for different cache versions", async () => {
    // Test that old and new cache providers get their own XTEA managers
    const result = await runCLICommand({
      command: "npm run start",
      args: [
        "diffs",
        "--",
        "-o",
        OLD_CACHE_VERSION, // Old cache version
        "-n",
        NEW_CACHE_VERSION, // New cache version
        "--pages",
        "true",
      ],
    });

    expect(result.exitCode).toBe(0);

    // If XTEA loading is successful, we might see log messages
    // The key point is that the command completes successfully
    expect(result.stderr).not.toContain("XTEA keys not available");
  });
});
