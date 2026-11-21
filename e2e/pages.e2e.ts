import { existsSync } from "fs";

import { NEW_CACHE_VERSION } from "./utils/cache-versions";
import { runCLICommand, cleanupOutput } from "./utils/cli";

describe("Pages Command E2E Tests", () => {
  afterEach(async () => {
    await cleanupOutput();
  });

  describe("Item Pages", () => {
    it("should generate item page with expected output file structure", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "item",
        ],
        expectedOutputFile: "./out/pages/item/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/item/1.txt")).toBe(true);
      expect(existsSync("./out/pages/item/named/Toolkit-1.txt")).toBe(true);
    });

    it("should generate item page content that matches snapshot", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "item",
        ],
        expectedOutputFile: "./out/pages/item/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toMatchSnapshot("item-1-output.txt");
    });

    it("should generate different item page for different ID", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "2",
          "--type",
          "item",
        ],
        expectedOutputFile: "./out/pages/item/2.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toMatchSnapshot("item-2-output.txt");
    });
  });

  describe("NPC Pages", () => {
    it("should generate npc page with expected output file structure", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "npc",
        ],
        expectedOutputFile: "./out/pages/npc/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/npc/1.txt")).toBe(true);
    });

    it("should generate npc page content that matches snapshot", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "npc",
        ],
        expectedOutputFile: "./out/pages/npc/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toMatchSnapshot("npc-1-output.txt");
    });
  });

  describe("Area Pages", () => {
    it("should generate area page with expected output file structure", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "area",
        ],
        expectedOutputFile: "./out/pages/area/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/area/1.txt")).toBe(true);
    });

    it("should generate area page content that matches snapshot", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "area",
        ],
        expectedOutputFile: "./out/pages/area/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toMatchSnapshot("area-1-output.txt");
    });
  });

  describe("Scenery Pages", () => {
    it("should generate scenery page with expected output file structure", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "scenery",
        ],
        expectedOutputFile: "./out/pages/scenery/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/scenery/1.txt")).toBe(true);
    });

    it("should generate scenery page content that matches snapshot", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "1",
          "--type",
          "scenery",
        ],
        expectedOutputFile: "./out/pages/scenery/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toMatchSnapshot("scenery-1-output.txt");
    });
  });

  describe("Quest Pages", () => {
    it("should generate a quest page with cache-derived data", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "13730",
          "--type",
          "quest",
          "--update",
          "Test-update",
        ],
        expectedOutputFile: "./out/pages/quest/13730.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/quest/13730.txt")).toBe(true);
      expect(
        existsSync("./out/pages/quest/named/Rag and Bone Man III-13730.txt")
      ).toBe(true);
      expect(result.outputContent).toContain("{{Infobox Quest");
      expect(result.outputContent).toContain(
        "Talk to the [[Odd Old Man]] in [[Silvarea]]."
      );
      expect(result.outputContent).toContain(
        "* {{SCP|Slayer|58|link=yes}} {{Boostable|no}} {{Questreqstart|yes}}"
      );
      expect(result.outputContent).toContain("|update = Test-update");
      expect(result.outputContent).toContain("{{Hastranscript|Quest}}");
      expect(result.outputContent).toContain("**[[Rag and Bone Man II]]");
      expect(result.outputContent.replace(/[ \t]+$/gm, "")).toMatchSnapshot(
        "quest-13730-output.txt"
      );
    });

    it("should format stat XP awards from the quest DBRow", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          NEW_CACHE_VERSION,
          "--id",
          "101",
          "--type",
          "quest",
        ],
        expectedOutputFile: "./out/pages/quest/101.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(result.outputContent).toContain(
        "*{{SCP|Crafting|1,406}} [[Crafting]] [[experience]]"
      );
    });
  });
});
