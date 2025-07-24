import npcPageBuilder from "./npc";
import Context from "../../../context";

import { NPCID, Params } from "@/utils/cache2";

describe("npcPageBuilder", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build npc infobox without combat level", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build monster infobox with combat level", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 100,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      size: 2,
      hitpoints: 100,
      attack: 200,
      defence: 300,
      magic: 400,
      ranged: 500,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should use beta id when Context.beta is true", async () => {
    const originalBeta = Context.beta;
    Context.beta = true;

    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();

    Context.beta = originalBeta;
  });

  it("should build npc page with transcript", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["Talk-to"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build npc page without chathead when no chatheadModels", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [], // NPC without chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should build npc page with chathead when has chatheadModels", async () => {
    const builder = await npcPageBuilder({
      name: "name",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(builder?.build()).toMatchSnapshot();
  });

  it("should strip HTML tags from NPC name in page content", async () => {
    const builder = await npcPageBuilder({
      name: "<col=00ffff>Tornado</col>",
      combatLevel: 1,
      actions: ["action1", "action2"],
      id: 1 as NPCID,
      params: new Params(),
      chatheadModels: [1, 2], // NPC with chathead models
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    const pageContent = builder?.build();
    expect(pageContent).toContain("|name = Tornado");
    expect(pageContent).toContain("[[File:Tornado.png|120px]]");
    expect(pageContent).toContain("[[File:Tornado chathead.png|left]]");
    expect(pageContent).toContain("'''Tornado'''");
    expect(pageContent).not.toContain("<col=00ffff>");
    expect(pageContent).not.toContain("</col>");
  });
});
