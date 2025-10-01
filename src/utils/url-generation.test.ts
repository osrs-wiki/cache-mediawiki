import {
  generateURL,
  substituteTemplate,
  regionToWorldMapURL,
} from "./url-generation";

describe("URL Generation", () => {
  describe("substituteTemplate", () => {
    test("replaces single placeholder", () => {
      expect(substituteTemplate("https://example.com/{id}", { id: 123 })).toBe(
        "https://example.com/123"
      );
    });

    test("replaces multiple placeholders", () => {
      expect(
        substituteTemplate("https://example.com/{type}/{id}", {
          type: "npc",
          id: 456,
        })
      ).toBe("https://example.com/npc/456");
    });

    test("URL encodes values", () => {
      expect(
        substituteTemplate("https://example.com/{name}", { name: "test item" })
      ).toBe("https://example.com/test%20item");
    });

    test("leaves unknown placeholders unchanged", () => {
      expect(
        substituteTemplate("https://example.com/{unknown}", { id: 123 })
      ).toBe("https://example.com/{unknown}");
    });

    test("handles special characters", () => {
      expect(
        substituteTemplate("https://example.com/{name}", {
          name: "item & stuff",
        })
      ).toBe("https://example.com/item%20%26%20stuff");
    });

    test("handles undefined values", () => {
      expect(
        substituteTemplate("https://example.com/{id}", { id: undefined })
      ).toBe("https://example.com/{id}");
    });

    test("handles null values", () => {
      expect(substituteTemplate("https://example.com/{id}", { id: null })).toBe(
        "https://example.com/null"
      );
    });
  });

  describe("regionToWorldMapURL", () => {
    test("converts region ID to world coordinates", () => {
      const regionId = (50 << 8) | 30; // Region X=50, Y=30
      const expectedX = 50 << 6; // 3200
      const expectedY = 30 << 6; // 1920

      expect(regionToWorldMapURL(regionId)).toBe(
        `https://osrs.world/?cx=${expectedX}&cy=26&cz=${expectedY}`
      );
    });

    test("handles edge case coordinates", () => {
      const regionId = (0 << 8) | 0; // Region X=0, Y=0
      const expectedX = 0;
      const expectedY = 0;

      expect(regionToWorldMapURL(regionId)).toBe(
        `https://osrs.world/?cx=${expectedX}&cy=26&cz=${expectedY}`
      );
    });

    test("handles max coordinates", () => {
      const regionId = (255 << 8) | 255; // Region X=255, Y=255
      const expectedX = 255 << 6; // 16320
      const expectedY = 255 << 6; // 16320

      expect(regionToWorldMapURL(regionId)).toBe(
        `https://osrs.world/?cx=${expectedX}&cy=26&cz=${expectedY}`
      );
    });

    test("handles string input", () => {
      const regionId = "12800"; // 50 << 8 = 12800
      const result = regionToWorldMapURL(regionId);
      expect(result).toContain("osrs.world");
      expect(result).toContain("cx=3200"); // 50 << 6
      expect(result).toContain("cz=0"); // 0 << 6
    });
  });

  describe("generateURL", () => {
    test("handles template URLs", () => {
      const context = { fieldName: "id", entityType: "npc", allFields: {} };
      expect(generateURL("https://example.com/{id}", 123, context)).toBe(
        "https://example.com/123"
      );
    });

    test("handles function URLs", () => {
      const context = { fieldName: "id", entityType: "region", allFields: {} };
      expect(
        generateURL(regionToWorldMapURL, (50 << 8) | 30, context)
      ).toContain("osrs.world");
    });

    test("passes context to function URLs", () => {
      const mockFunction = jest.fn().mockReturnValue("https://test.com");
      const context = {
        fieldName: "id",
        entityType: "test",
        allFields: { foo: "bar" },
      };

      generateURL(mockFunction, 123, context);

      expect(mockFunction).toHaveBeenCalledWith(123, context);
    });

    test("uses context.allFields for template substitution", () => {
      const context = {
        fieldName: "id",
        entityType: "test",
        allFields: { name: "Test Item", category: "weapon" },
      };

      expect(
        generateURL("https://example.com/{name}/{category}/{id}", 456, context)
      ).toBe("https://example.com/Test%20Item/weapon/456");
    });
  });
});
