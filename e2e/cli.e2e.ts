import { runCLICommand, cleanupOutput } from "./utils/cli";

describe("CLI E2E Tests", () => {
  afterEach(async () => {
    await cleanupOutput();
  });

  describe("Main CLI", () => {
    it("should show help when --help is passed", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: ["--", "--help"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Usage: Cache to MediaWiki tools");
      expect(result.stdout).toContain("A set of scripts for fetching content");
      expect(result.stdout).toContain("pages|page");
    });

    it("should show version when --version is passed", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: ["--", "--version"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe("Pages Command", () => {
    it("should show help for pages command", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: ["pages", "--", "--help"],
      });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain(
        "Generate a page for an area, item, npc, or scenery"
      );
      expect(result.stdout).toContain("-t, --type <type>");
      expect(result.stdout).toContain("-i, --id <id>");
      expect(result.stdout).toContain("-n, --newCache <newCache>");
    });

    it("should require newCache and id parameters", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: ["pages", "--", "--type", "item"],
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "error: required option '-i, --id <id>' not specified"
      );
    });

    it("should require id parameter", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: ["pages", "--", "--newCache", "test-cache"],
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "error: required option '-i, --id <id>' not specified"
      );
    });

    it("should validate type choices", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          "test-cache",
          "--id",
          "123",
          "--type",
          "invalid",
        ],
      });

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain(
        "error: option '-t, --type <type>' argument 'invalid' is invalid"
      );
      expect(result.stderr).toContain(
        "Allowed choices are area, item, npc, scenery"
      );
    });
  });
});
