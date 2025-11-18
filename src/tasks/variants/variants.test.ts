jest.mock("fs/promises", () => ({
  readdir: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
  rename: jest.fn(),
  access: jest.fn(),
}));

import { readdir, readFile, writeFile, rename, access } from "fs/promises";

import replaceVariants from "./variants";
import type { VariantConfig } from "./variants.types";

const mockReaddir = readdir as jest.Mock;
const mockReadFile = readFile as jest.Mock;
const mockWriteFile = writeFile as jest.Mock;
const mockRename = rename as jest.Mock;
const mockAccess = access as jest.Mock;

describe("variants task", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("replaceVariants", () => {
    it("should process files and update content", async () => {
      const content = `{{Infobox Item
|name = Test Item
|examine1 = This is for Aldarin.
|version1 = 1
|image1 = [[File:Test Item.png]]
}}`;

      mockReaddir.mockResolvedValue(["test.txt"] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile.mockResolvedValue(content);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version", "image"],
        skipFirstVersionSuffix: true,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
      const writtenContent = mockWriteFile.mock.calls[0][1] as string;
      expect(writtenContent).toContain("|version1 = Aldarin");
      expect(writtenContent).toContain(
        "|image1 = [[File:Test Item (Aldarin).png]]"
      );
    });

    it("should not write files in dry run mode", async () => {
      const content = `{{Infobox Item
|name = Test Item
|examine1 = This is for Aldarin.
|version1 = 1
}}`;

      mockReaddir.mockResolvedValue(["test.txt"] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile.mockResolvedValue(content);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: true,
      };

      await replaceVariants(config);

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should skip files that do not match item filter", async () => {
      const content1 = `{{Infobox Item
|name = Crate of fish
|examine1 = This is for Aldarin.
|version1 = 1
}}`;

      const content2 = `{{Infobox Item
|name = Sword
|examine1 = This is for Rellekka.
|version1 = 1
}}`;

      mockReaddir.mockResolvedValue([
        "Crate of fish-123.txt",
        "Sword-456.txt",
      ] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        itemFilter: /^Crate of/,
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockWriteFile).toHaveBeenCalledTimes(1);
    });

    it("should handle empty file list", async () => {
      mockReaddir.mockResolvedValue([] as any); // eslint-disable-line @typescript-eslint/no-explicit-any

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should process image renames when directories specified", async () => {
      const content = `{{Infobox Item
|name = Test Item
|examine1 = This is for Aldarin.
|version1 = 1
}}`;

      mockReaddir.mockResolvedValue(["test.txt"] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile.mockResolvedValue(content);
      mockAccess.mockResolvedValue(undefined);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version", "image"],
        imageDirectories: ["images"],
        skipFirstVersionSuffix: true,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockRename).toHaveBeenCalled();
    });

    it("should skip files without matching variants", async () => {
      const content = `{{Infobox Item
|name = Test Item
|examine1 = No pattern match here.
}}`;

      mockReaddir.mockResolvedValue(["test.txt"] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile.mockResolvedValue(content);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /destined for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockWriteFile).not.toHaveBeenCalled();
    });

    it("should process multiple files with different variant counts", async () => {
      const content1 = `{{Infobox Item
|name = Item One
|examine1 = This is for Aldarin.
|version1 = 1
}}`;

      const content2 = `{{Infobox Item
|name = Item Two
|examine1 = This is for Rellekka.
|examine2 = This is for Port Sarim.
|version1 = 1
|version2 = 2
}}`;

      mockReaddir.mockResolvedValue(["item1.txt", "item2.txt"] as any); // eslint-disable-line @typescript-eslint/no-explicit-any
      mockReadFile
        .mockResolvedValueOnce(content1)
        .mockResolvedValueOnce(content2);

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      await replaceVariants(config);

      expect(mockWriteFile).toHaveBeenCalledTimes(2);
      const content1Written = mockWriteFile.mock.calls[0][1] as string;
      const content2Written = mockWriteFile.mock.calls[1][1] as string;

      expect(content1Written).toContain("|version1 = Aldarin");
      expect(content2Written).toContain("|version1 = Rellekka");
      expect(content2Written).toContain("|version2 = Port Sarim");
    });
  });
});
