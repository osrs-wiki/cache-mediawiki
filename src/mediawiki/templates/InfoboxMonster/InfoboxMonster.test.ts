import InfoboxMonsterTemplate from "./InfoboxMonster";

import {
  STAB_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  CRUSH_DEFENCE_PARAM,
} from "@/types/params";
import { NPCID, Params, NPC } from "@/utils/cache2";

// Helper function to create mock NPCs for testing
const createMockNpc = (
  name: string, 
  id: number, 
  combatLevel = 100, 
  params = new Params(),
  examineText = ""
): NPC => ({
  name,
  id: id as NPCID,
  combatLevel,
  size: 1,
  hitpoints: combatLevel * 2,
  attack: Math.floor(combatLevel * 0.8),
  defence: Math.floor(combatLevel * 0.7),
  magic: Math.floor(combatLevel * 0.6),
  ranged: Math.floor(combatLevel * 0.9),
  params,
  examine: examineText,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any);

describe("InfoboxMonsterTemplate", () => {
  it("should include NPC params in the infobox when they exist", () => {
    const params = new Params();
    params.set(STAB_ATTACK_PARAM, 50);
    params.set(SLASH_DEFENCE_PARAM, 25);
    params.set(MAGIC_ATTACK_PARAM, 75);
    params.set(RANGED_DEFENCE_PARAM, 30);

    const npc = createMockNpc("Test Monster", 1234, 100, params);

    const template = InfoboxMonsterTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that the template includes the param-based stats
    const templateParams = built.params || [];
    const attbnsParam = templateParams.find((p) => p.key === "attbns");
    const dslashParam = templateParams.find((p) => p.key === "dslash");
    const amagicParam = templateParams.find((p) => p.key === "amagic");

    expect(attbnsParam?.value).toBe("50");
    expect(dslashParam?.value).toBe("25");
    expect(amagicParam?.value).toBe("75");
  });

  it("should not include param stats when they don't exist", () => {
    const npc = createMockNpc("Test Monster", 5678, 50);

    const template = InfoboxMonsterTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that param-based stats are not included when they don't exist
    const templateParams = built.params || [];
    const attbnsParam = templateParams.find((p) => p.key === "attbns");
    const dslashParam = templateParams.find((p) => p.key === "dslash");
    const amagicParam = templateParams.find((p) => p.key === "amagic");
    const dlightParam = templateParams.find((p) => p.key === "dlight");

    expect(attbnsParam).toBeUndefined();
    expect(dslashParam).toBeUndefined();
    expect(amagicParam).toBeUndefined();
    expect(dlightParam).toBeUndefined();
  });

  it("should strip HTML tags from monster name", () => {
    const npc = createMockNpc("<col=ff0000>Red Dragon</col>", 9999, 152);

    const template = InfoboxMonsterTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that the name parameter is stripped of HTML tags
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Red Dragon");

    // Verify that the image filename is also stripped of HTML tags
    const imageParam = templateParams.find((p) => p.key === "image");
    expect(imageParam?.value).toContain("Red Dragon.png");
    expect(imageParam?.value).not.toContain("<col=");
    expect(imageParam?.value).not.toContain("</col>");
  });

  it("should handle monster names without HTML tags", () => {
    const npc = createMockNpc("Normal Monster", 8888, 75);

    const template = InfoboxMonsterTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that normal names are preserved
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Normal Monster");
  });

  describe("multi-version functionality", () => {
    it("should generate versioned template for multiple monsters with same name", () => {
      const params1 = new Params();
      params1.set(STAB_ATTACK_PARAM, 50);
      params1.set(MELEE_STRENGTH_PARAM, 45);
      
      const params2 = new Params();
      params2.set(STAB_ATTACK_PARAM, 60);
      params2.set(CRUSH_DEFENCE_PARAM, 35);

      const monster1 = createMockNpc("Dragon", 4001, 120, params1, "A fearsome dragon.");
      const monster2 = createMockNpc("Dragon", 4002, 150, params2, "An even more fearsome dragon.");
      const monster3 = createMockNpc("Dragon", 4003, 120, new Params(), "A dragon with no special stats.");

      const template = InfoboxMonsterTemplate([monster1, monster2, monster3]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Check version parameters
      expect(templateParams.find(p => p.key === "version1")?.value).toBe("1");
      expect(templateParams.find(p => p.key === "version2")?.value).toBe("2");
      expect(templateParams.find(p => p.key === "version3")?.value).toBe("3");

      // Check shared parameters (same name)
      expect(templateParams.find(p => p.key === "name")?.value).toBe("Dragon");

      // Check numbered parameters (different values)
      expect(templateParams.find(p => p.key === "combat1")?.value).toBe("120");
      expect(templateParams.find(p => p.key === "combat2")?.value).toBe("150");
      expect(templateParams.find(p => p.key === "combat3")?.value).toBe("120");

      expect(templateParams.find(p => p.key === "id1")?.value).toBe("4001");
      expect(templateParams.find(p => p.key === "id2")?.value).toBe("4002");
      expect(templateParams.find(p => p.key === "id3")?.value).toBe("4003");

      // Check image naming convention
      expect(templateParams.find(p => p.key === "image1")?.value).toContain("Dragon.png");
      expect(templateParams.find(p => p.key === "image2")?.value).toContain("Dragon (2).png");
      expect(templateParams.find(p => p.key === "image3")?.value).toContain("Dragon (3).png");

      // Check param-based stats are numbered when they differ
      expect(templateParams.find(p => p.key === "attbns1")?.value).toBe("50");
      expect(templateParams.find(p => p.key === "attbns2")?.value).toBe("60");
      expect(templateParams.find(p => p.key === "attbns3")).toBeUndefined();
    });

    it("should handle array with single monster", () => {
      const monster = createMockNpc("Solo Dragon", 5001, 200);
      
      const template = InfoboxMonsterTemplate([monster]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Single monster in array should use single monster behavior (no versioned parameters)
      expect(templateParams.find(p => p.key === "version1")).toBeUndefined();
      expect(templateParams.find(p => p.key === "name")?.value).toBe("Solo Dragon");
      expect(templateParams.find(p => p.key === "combat")?.value).toBe("200");
    });

    it("should handle multiple monsters with shared stats", () => {
      const sharedParams = new Params();
      sharedParams.set(STAB_ATTACK_PARAM, 100);
      sharedParams.set(SLASH_DEFENCE_PARAM, 80);

      const monster1 = createMockNpc("Elite Guard", 6001, 180, sharedParams);
      const monster2 = createMockNpc("Elite Guard", 6002, 180, sharedParams);

      const template = InfoboxMonsterTemplate([monster1, monster2]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      
      // Shared stats should use non-numbered parameters
      expect(templateParams.find(p => p.key === "combat")?.value).toBe("180");
      expect(templateParams.find(p => p.key === "attbns")?.value).toBe("100");
      expect(templateParams.find(p => p.key === "dslash")?.value).toBe("80");

      // Different IDs should be numbered
      expect(templateParams.find(p => p.key === "id1")?.value).toBe("6001");
      expect(templateParams.find(p => p.key === "id2")?.value).toBe("6002");
    });

    it("should handle empty array", () => {
      const template = InfoboxMonsterTemplate([]);
      const built = template.build();

      expect(built).toMatchSnapshot();

      const templateParams = built.params || [];
      expect(templateParams).toHaveLength(0);
    });
  });
});
