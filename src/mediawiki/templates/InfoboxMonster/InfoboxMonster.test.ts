import InfoboxMonsterTemplate from "./InfoboxMonster";

import {
  STAB_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
} from "@/types/params";
import { NPCID, Params } from "@/utils/cache2";

describe("InfoboxMonsterTemplate", () => {
  it("should include NPC params in the infobox when they exist", () => {
    const params = new Params();
    params.set(STAB_ATTACK_PARAM, 50);
    params.set(SLASH_DEFENCE_PARAM, 25);
    params.set(MAGIC_ATTACK_PARAM, 75);
    params.set(RANGED_DEFENCE_PARAM, 30);

    const npc = {
      name: "Test Monster",
      combatLevel: 100,
      size: 1,
      hitpoints: 200,
      attack: 80,
      defence: 70,
      magic: 60,
      ranged: 90,
      id: 1234 as NPCID,
      params,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

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
    const npc = {
      name: "Test Monster",
      combatLevel: 50,
      size: 1,
      hitpoints: 100,
      attack: 40,
      defence: 35,
      magic: 30,
      ranged: 45,
      id: 5678 as NPCID,
      params: new Params(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

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
    const npc = {
      name: "<col=ff0000>Red Dragon</col>",
      combatLevel: 152,
      size: 2,
      hitpoints: 300,
      attack: 90,
      defence: 80,
      magic: 85,
      ranged: 95,
      id: 9999 as NPCID,
      params: new Params(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

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
    const npc = {
      name: "Normal Monster",
      combatLevel: 75,
      size: 1,
      hitpoints: 150,
      attack: 60,
      defence: 55,
      magic: 50,
      ranged: 65,
      id: 8888 as NPCID,
      params: new Params(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const template = InfoboxMonsterTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that normal names are preserved
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Normal Monster");
  });
});
