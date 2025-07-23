import { InfoboxTemplate } from "./InfoboxTemplate";

describe("InfoboxTemplate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      expect(result.build()).toMatchSnapshot();
    });
  });

  describe("multiple params", () => {
    it("should build template with shared parameters when values are the same", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, location: "Varrock" },
        { name: "Guard", level: 21, location: "Varrock" },
      ]);

      const result = template.build();
      expect(result.build()).toMatchSnapshot();
    });

    it("should build template with numbered parameters when values differ", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order." },
        { name: "Guard", level: 21, examine: "She tries to keep order." },
      ]);

      const result = template.build();
      expect(result.build()).toMatchSnapshot();
    });

    it("should handle mixed shared and numbered parameters", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order.", id: "1001" },
        { name: "Guard", level: 22, examine: "She tries to keep order.", id: "1002" },
      ]);

      const result = template.build();
      expect(result.build()).toMatchSnapshot();
    });

    it("should handle undefined values properly", () => {
      const template = new InfoboxTemplate("monster", [
        { name: "Guard", level: 21, examine: "He tries to keep order." },
        { name: "Guard", level: 21 }, // missing examine
      ]);

      const result = template.build();
      expect(result.build()).toMatchSnapshot();
    });
  });
});