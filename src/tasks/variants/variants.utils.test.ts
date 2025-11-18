import type { VariantConfig, FileData } from "./variants.types";
import {
  extractCustomName,
  extractItemName,
  parseVariantMapping,
  updateVersionParameter,
  updateImageParameter,
  updateFileContent,
  generateImageRenames,
  formatFileName,
} from "./variants.utils";

describe("variants.utils", () => {
  describe("extractCustomName", () => {
    it("should extract custom name from text using regex", () => {
      const text = "This crate is destined for Aldarin.";
      const pattern = /destined for (.+?)\./;
      expect(extractCustomName(text, pattern)).toBe("Aldarin");
    });

    it("should return null when no match found", () => {
      const text = "This has no destination";
      const pattern = /destined for (.+?)\./;
      expect(extractCustomName(text, pattern)).toBeNull();
    });

    it("should trim extracted names", () => {
      const text = "This is for   Rellekka  .";
      const pattern = /for (.+?)\./;
      expect(extractCustomName(text, pattern)).toBe("Rellekka");
    });
  });

  describe("extractItemName", () => {
    it("should extract item name from content", () => {
      const content = `{{Infobox Item
|name = Crate of fish
|release = [[28 August]] [[2024]]`;
      expect(extractItemName(content)).toBe("Crate of fish");
    });

    it("should return empty string when name not found", () => {
      const content = "{{Infobox Item\n|release = [[28 August]]";
      expect(extractItemName(content)).toBe("");
    });
  });

  describe("parseVariantMapping", () => {
    it("should parse variant mappings from content", () => {
      const content = `{{Infobox Item
|name = Crate of fish
|examine1 = This crate is destined for Aldarin.
|examine2 = This crate is destined for Rellekka.
|examine3 = This crate is destined for Port Sarim.`;

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /destined for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      const result = parseVariantMapping(content, config);
      expect(result).toEqual({
        "1": "Aldarin",
        "2": "Rellekka",
        "3": "Port Sarim",
      });
    });

    it("should handle missing variants", () => {
      const content = `{{Infobox Item
|examine1 = This crate is destined for Aldarin.
|examine3 = This crate is destined for Port Sarim.`;

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /destined for (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      const result = parseVariantMapping(content, config);
      expect(result).toEqual({
        "1": "Aldarin",
        "3": "Port Sarim",
      });
    });

    it("should handle custom source parameters", () => {
      const content = `{{Infobox Item
|description1 = Made in Varrock.
|description2 = Made in Falador.`;

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "description",
        extractionPattern: /Made in (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      const result = parseVariantMapping(content, config);
      expect(result).toEqual({
        "1": "Varrock",
        "2": "Falador",
      });
    });
  });

  describe("updateVersionParameter", () => {
    it("should update version parameters", () => {
      const content = `{{Infobox Item
|version1 = 1
|version2 = 2
|version3 = 3`;

      let result = updateVersionParameter(content, "version", "1", "Aldarin");
      result = updateVersionParameter(result, "version", "2", "Rellekka");
      result = updateVersionParameter(result, "version", "3", "Port Sarim");

      expect(result).toContain("|version1 = Aldarin");
      expect(result).toContain("|version2 = Rellekka");
      expect(result).toContain("|version3 = Port Sarim");
    });

    it("should replace all occurrences", () => {
      const content = `{{Infobox Item
|version1 = 1
}}
{{Infobox Bonuses
|version1 = 1`;

      const result = updateVersionParameter(content, "version", "1", "Test");

      expect(result).toBe(`{{Infobox Item
|version1 = Test
}}
{{Infobox Bonuses
|version1 = Test`);
    });
  });

  describe("updateImageParameter", () => {
    it("should update basic image parameters", () => {
      const content = `|image1 = [[File:Crate of fish.png]]
|image2 = [[File:Crate of fish (2).png]]`;

      let result = updateImageParameter(
        content,
        "Crate of fish",
        "image",
        "1",
        "Aldarin",
        true
      );
      result = updateImageParameter(
        result,
        "Crate of fish",
        "image",
        "2",
        "Rellekka",
        false
      );

      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin).png]]"
      );
      expect(result).toContain(
        "|image2 = [[File:Crate of fish (Rellekka).png]]"
      );
    });

    it("should update detail images", () => {
      const content = `|image1 = [[File:Crate of fish detail.png]]`;

      const result = updateImageParameter(
        content,
        "Crate of fish",
        "image",
        "1",
        "Aldarin",
        true
      );

      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin) detail.png]]"
      );
    });

    it("should handle synced switch format", () => {
      const content = `|image1 = [[File:Crate of fish detail.png|130px|left]]
|image2 = [[File:Crate of fish (2) detail.png|130px|left]]`;

      let result = updateImageParameter(
        content,
        "Crate of fish",
        "image",
        "1",
        "Aldarin",
        true
      );
      result = updateImageParameter(
        result,
        "Crate of fish",
        "image",
        "2",
        "Rellekka",
        false
      );

      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin) detail.png|130px|left]]"
      );
      expect(result).toContain(
        "|image2 = [[File:Crate of fish (Rellekka) detail.png|130px|left]]"
      );
    });

    it("should handle first version without suffix when skipFirstSuffix is true", () => {
      const content = `|image1 = [[File:Crate of fish.png]]`;

      const result = updateImageParameter(
        content,
        "Crate of fish",
        "image",
        "1",
        "Aldarin",
        true
      );

      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin).png]]"
      );
    });

    it("should handle first version with suffix when skipFirstSuffix is false", () => {
      const content = `|image1 = [[File:Crate of fish (1).png]]`;

      const result = updateImageParameter(
        content,
        "Crate of fish",
        "image",
        "1",
        "Aldarin",
        false
      );

      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin).png]]"
      );
    });
  });

  describe("updateFileContent", () => {
    it("should update all variant parameters", () => {
      const content = `{{Infobox Item
|name = Crate of fish
|version1 = 1
|version2 = 2
|image1 = [[File:Crate of fish.png]]
|image2 = [[File:Crate of fish (2).png]]
}}`;

      const fileData: FileData = {
        filePath: "test.txt",
        content,
        itemName: "Crate of fish",
        versionCount: 2,
        variantMap: {
          "1": "Aldarin",
          "2": "Rellekka",
        },
      };

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /destined for (.+?)\./,
        targetParams: ["version", "image"],
        skipFirstVersionSuffix: true,
        dryRun: false,
      };

      const result = updateFileContent(fileData, config);

      expect(result).toContain("|version1 = Aldarin");
      expect(result).toContain("|version2 = Rellekka");
      expect(result).toContain(
        "|image1 = [[File:Crate of fish (Aldarin).png]]"
      );
      expect(result).toContain(
        "|image2 = [[File:Crate of fish (Rellekka).png]]"
      );
    });

    it("should skip versions without custom names", () => {
      const content = `{{Infobox Item
|version1 = 1
|version2 = 2
|version3 = 3
}}`;

      const fileData: FileData = {
        filePath: "test.txt",
        content,
        itemName: "Test Item",
        versionCount: 3,
        variantMap: {
          "1": "Version A",
          "3": "Version C",
        },
      };

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /test (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      const result = updateFileContent(fileData, config);

      expect(result).toContain("|version1 = Version A");
      expect(result).toContain("|version2 = 2"); // Unchanged
      expect(result).toContain("|version3 = Version C");
    });
  });

  describe("generateImageRenames", () => {
    it("should generate rename operations for images", () => {
      const fileData: FileData = {
        filePath: "test.txt",
        content: "",
        itemName: "Crate of fish",
        versionCount: 2,
        variantMap: {
          "1": "Aldarin",
          "2": "Rellekka",
        },
      };

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /destined for (.+?)\./,
        targetParams: ["version", "image"],
        imageDirectories: ["images/items"],
        skipFirstVersionSuffix: true,
        dryRun: false,
      };

      const result = generateImageRenames(fileData, config);

      expect(result).toContainEqual({
        directory: "images/items",
        oldName: "Crate of fish.png",
        newName: "Crate of fish (Aldarin).png",
      });
      expect(result).toContainEqual({
        directory: "images/items",
        oldName: "Crate of fish detail.png",
        newName: "Crate of fish (Aldarin) detail.png",
      });
      expect(result).toContainEqual({
        directory: "images/items",
        oldName: "Crate of fish (2).png",
        newName: "Crate of fish (Rellekka).png",
      });
      expect(result).toContainEqual({
        directory: "images/items",
        oldName: "Crate of fish (2) detail.png",
        newName: "Crate of fish (Rellekka) detail.png",
      });
    });

    it("should return empty array when no image directories specified", () => {
      const fileData: FileData = {
        filePath: "test.txt",
        content: "",
        itemName: "Test Item",
        versionCount: 2,
        variantMap: {
          "1": "Version A",
          "2": "Version B",
        },
      };

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /test (.+?)\./,
        targetParams: ["version"],
        skipFirstVersionSuffix: false,
        dryRun: false,
      };

      const result = generateImageRenames(fileData, config);

      expect(result).toEqual([]);
    });

    it("should generate renames for multiple directories", () => {
      const fileData: FileData = {
        filePath: "test.txt",
        content: "",
        itemName: "Test Item",
        versionCount: 1,
        variantMap: {
          "1": "Variant",
        },
      };

      const config: VariantConfig = {
        sourceDir: "test",
        pattern: "*.txt",
        sourceParam: "examine",
        extractionPattern: /test (.+?)\./,
        targetParams: ["image"],
        imageDirectories: ["images/items", "images/inventory"],
        skipFirstVersionSuffix: true,
        dryRun: false,
      };

      const result = generateImageRenames(fileData, config);

      expect(result.filter((r) => r.directory === "images/items")).toHaveLength(
        2
      );
      expect(
        result.filter((r) => r.directory === "images/inventory")
      ).toHaveLength(2);
      expect(result).toHaveLength(4);
    });
  });

  describe("formatFileName", () => {
    it("should replace colons with dashes", () => {
      expect(formatFileName("File:Name.txt")).toBe("File-Name.txt");
    });

    it("should remove question marks", () => {
      expect(formatFileName("What?.txt")).toBe("What.txt");
    });

    it("should remove angle brackets and their contents", () => {
      expect(formatFileName("Item <special>.txt")).toBe("Item .txt");
    });

    it("should handle multiple replacements", () => {
      expect(formatFileName("File:Test? <note>.txt")).toBe("File-Test .txt");
    });

    it("should return unchanged if no special characters", () => {
      expect(formatFileName("Normal Name.txt")).toBe("Normal Name.txt");
    });
  });
});
