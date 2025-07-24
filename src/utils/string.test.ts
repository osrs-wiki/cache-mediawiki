import { capitalize, lowerCaseFirst, vowel, stripHtmlTags } from "./string";

describe("string utils", () => {
  describe("capitalize", () => {
    it("should capitalize first character", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("world")).toBe("World");
    });
  });

  describe("lowerCaseFirst", () => {
    it("should lowercase first character", () => {
      expect(lowerCaseFirst("Hello")).toBe("hello");
      expect(lowerCaseFirst("World")).toBe("world");
    });
  });

  describe("vowel", () => {
    it("should return 'an' for vowel-starting words", () => {
      expect(vowel("apple")).toBe("an");
      expect(vowel("elephant")).toBe("an");
    });

    it("should return 'a' for consonant-starting words", () => {
      expect(vowel("book")).toBe("a");
      expect(vowel("house")).toBe("a");
    });
  });

  describe("stripHtmlTags", () => {
    it("should strip HTML tags from text", () => {
      expect(stripHtmlTags("<col=00ffff>Tornado</col>")).toBe("Tornado");
      expect(stripHtmlTags("<b>Bold text</b>")).toBe("Bold text");
      expect(stripHtmlTags("Normal text")).toBe("Normal text");
    });

    it("should handle multiple tags", () => {
      expect(stripHtmlTags("<col=ff0000>Red</col> and <col=00ff00>Green</col>")).toBe("Red and Green");
    });

    it("should handle nested tags", () => {
      expect(stripHtmlTags("<div><span>Nested</span></div>")).toBe("Nested");
    });

    it("should handle empty tags", () => {
      expect(stripHtmlTags("Text with <> empty tags")).toBe("Text with  empty tags");
    });

    it("should handle self-closing tags", () => {
      expect(stripHtmlTags("Text with <br/> line break")).toBe("Text with  line break");
    });
  });
});