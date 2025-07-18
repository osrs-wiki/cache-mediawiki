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
});
