import InfoboxNpcTemplate from "./InfoboxNpc";

import { NPCID, Params, NPC } from "@/utils/cache2";

// Helper function to create mock NPCs for testing
const createMockNpc = (name: string, id: number, combatLevel = 0, examineText = ""): NPC => ({
  name,
  id: id as NPCID,
  combatLevel,
  size: 1,
  actions: ["Talk-to", "Examine"],
  params: new Params(),
  examine: examineText,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe("InfoboxNpcTemplate", () => {
  it("should strip HTML tags from NPC name", () => {
    const npc = createMockNpc("<col=00ffff>Tornado</col>", 1234, 1);

    const template = InfoboxNpcTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that the name parameter is stripped of HTML tags
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Tornado");

    // Verify that the image filename is also stripped of HTML tags
    const imageParam = templateParams.find((p) => p.key === "image");
    expect(imageParam?.value).toContain("Tornado.png");
    expect(imageParam?.value).not.toContain("<col=");
    expect(imageParam?.value).not.toContain("</col>");
  });

  it("should handle NPC names without HTML tags", () => {
    const npc = createMockNpc("Normal NPC", 5678, 50);

    const template = InfoboxNpcTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that normal names are preserved
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Normal NPC");
  });

  describe("multi-version functionality", () => {
    it("should generate versioned template for multiple NPCs with same name", () => {
      const npc1 = createMockNpc("Guard", 1001, 21, "He tries to keep order around here.");
      const npc2 = createMockNpc("Guard", 1002, 21, "She tries to keep order around here.");
      const npc3 = createMockNpc("Guard", 1003, 25, "Another guard with different combat level.");

      const template = InfoboxNpcTemplate([npc1, npc2, npc3]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Check version parameters
      expect(templateParams.find(p => p.key === "version1")?.value).toBe("1");
      expect(templateParams.find(p => p.key === "version2")?.value).toBe("2");
      expect(templateParams.find(p => p.key === "version3")?.value).toBe("3");

      // Check shared parameters (same values across all NPCs)
      expect(templateParams.find(p => p.key === "name")?.value).toBe("Guard");

      // Check numbered parameters (different values)
      expect(templateParams.find(p => p.key === "id1")?.value).toBe("1001");
      expect(templateParams.find(p => p.key === "id2")?.value).toBe("1002");
      expect(templateParams.find(p => p.key === "id3")?.value).toBe("1003");

      // Check image naming convention
      expect(templateParams.find(p => p.key === "image1")?.value).toContain("Guard.png");
      expect(templateParams.find(p => p.key === "image2")?.value).toContain("Guard (2).png");
      expect(templateParams.find(p => p.key === "image3")?.value).toContain("Guard (3).png");
    });

    it("should handle array with single NPC", () => {
      const npc = createMockNpc("Single Guard", 2001, 30);
      
      const template = InfoboxNpcTemplate([npc]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Single NPC in array should use single NPC behavior (no versioned parameters)
      expect(templateParams.find(p => p.key === "version1")).toBeUndefined();
      expect(templateParams.find(p => p.key === "name")?.value).toBe("Single Guard");
      expect(templateParams.find(p => p.key === "id")?.value).toBe("2001");
    });

    it("should handle multiple NPCs with HTML tags in names", () => {
      const npc1 = createMockNpc("<col=ff0000>Red Guard</col>", 3001, 40);
      const npc2 = createMockNpc("<col=0000ff>Blue Guard</col>", 3002, 40);

      const template = InfoboxNpcTemplate([npc1, npc2]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Names are different after stripping HTML, so they should be numbered
      expect(templateParams.find(p => p.key === "name1")?.value).toBe("Red Guard");
      expect(templateParams.find(p => p.key === "name2")?.value).toBe("Blue Guard");

      // Verify image filenames are cleaned
      expect(templateParams.find(p => p.key === "image1")?.value).toContain("Red Guard.png");
      expect(templateParams.find(p => p.key === "image2")?.value).toContain("Blue Guard (2).png");
    });

    it("should handle empty array", () => {
      const template = InfoboxNpcTemplate([]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      expect(templateParams).toHaveLength(0);
    });
  });
});