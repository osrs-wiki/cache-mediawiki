import InfoboxNpcTemplate from "./InfoboxNpc";

import { NPCID, Params } from "@/utils/cache2";

describe("InfoboxNpcTemplate", () => {
  it("should strip HTML tags from NPC name", () => {
    const npc = {
      name: "<col=00ffff>Tornado</col>",
      combatLevel: 1,
      size: 1,
      actions: ["Talk-to", "Examine"],
      id: 1234 as NPCID,
      params: new Params(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

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
    const npc = {
      name: "Normal NPC",
      combatLevel: 50,
      size: 1,
      actions: ["Talk-to", "Examine"],
      id: 5678 as NPCID,
      params: new Params(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const template = InfoboxNpcTemplate(npc);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that normal names are preserved
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Normal NPC");
  });
});