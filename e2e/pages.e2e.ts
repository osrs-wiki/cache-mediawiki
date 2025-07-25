import { existsSync } from "fs";

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
          "test-cache",
          "--id",
          "1",
          "--type",
          "item",
        ],
        expectedOutputFile: "./out/pages/item/1.txt",
      });

      expect(result.exitCode).toBe(0);
      expect(existsSync("./out/pages/item/1.txt")).toBe(true);
      expect(existsSync("./out/pages/item/named/Toolkit.txt")).toBe(true);
    });

    it("should generate item page content that matches snapshot", async () => {
      const result = await runCLICommand({
        command: "npm run start",
        args: [
          "pages",
          "--",
          "--newCache",
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
          "test-cache",
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
});
