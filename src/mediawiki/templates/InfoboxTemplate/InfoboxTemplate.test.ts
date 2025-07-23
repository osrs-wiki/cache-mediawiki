import { InfoboxTemplate } from "./InfoboxTemplate";

import { capitalize } from "@/utils/strings";

describe("InfoboxTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("capitalize", () => {
    it("should capitalize the first letter of a string", () => {
      expect(capitalize("test")).toBe("Test");
      expect(capitalize("UPPERCASE")).toBe("UPPERCASE");
      expect(capitalize("")).toBe("");
      expect(capitalize("a")).toBe("A");
    });
  });

  describe("single params", () => {
    it("should build template with single params", () => {
      const template = new InfoboxTemplate("test", {
        name: "Test Name",
        level: 10,
        active: true,
        disabled: false,
      });

      const result = template.build();
      expect(result.name).toBe("Infobox Test");
      
      const built = result.build();
      expect(built).toContain("{{Infobox Test");
      expect(built).toContain("|name = Test Name");
      expect(built).toContain("|level = 10");
      expect(built).toContain("|active = Yes");
      expect(built).toContain("|disabled = No");
    });
  });

  describe("multiple params", () => {
    it("should build template with shared parameters when values are the same", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, location: "Varrock" },
        { name: "Guard", level: 21, location: "Varrock" },
      ]);

      const result = template.build();
      const built = result.build();
      
      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|level = 21");
      expect(built).toContain("|location = Varrock");
    });

    it("should build template with numbered parameters when values differ", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order." },
        { name: "Guard", level: 21, examine: "She tries to keep order." },
      ]);

      const result = template.build();
      const built = result.build();
      
      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|level = 21");
      expect(built).toContain("|examine1 = He tries to keep order.");
      expect(built).toContain("|examine2 = She tries to keep order.");
    });

    it("should handle mixed shared and numbered parameters", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order.", id: "1001" },
        { name: "Guard", level: 22, examine: "She tries to keep order.", id: "1002" },
      ]);

      const result = template.build();
      const built = result.build();
      
      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|level1 = 21");
      expect(built).toContain("|level2 = 22");
      expect(built).toContain("|examine1 = He tries to keep order.");
      expect(built).toContain("|examine2 = She tries to keep order.");
      expect(built).toContain("|id1 = 1001");
      expect(built).toContain("|id2 = 1002");
    });

    it("should handle undefined values properly", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order." },
        { name: "Guard", level: 21 }, // missing examine
      ]);

      const result = template.build();
      const built = result.build();
      
      expect(built).toContain("{{Infobox Monster");
      expect(built).toContain("|version1 = 1");
      expect(built).toContain("|version2 = 2");
      expect(built).toContain("|name = Guard");
      expect(built).toContain("|level = 21");
      expect(built).toContain("|examine1 = He tries to keep order.");
      expect(built).not.toContain("|examine2 =");
    });
  });
});