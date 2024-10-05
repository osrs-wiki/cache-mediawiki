import fsPromises from "fs/promises";

import npcInfoboxGenerator, {
  buildMonsterInfobox,
  buildNpcInfobox,
} from "./npc";
import * as builders from "./npc";
import { NPC, NPCID } from "../../../../utils/cache2";

describe("NPC Infobox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  describe("npcInfoboxGenerator", () => {
    it("should generate monster infobox for an npc with a combat level", async () => {
      jest.spyOn(NPC, "load").mockReturnValue({ id: 1, combatLevel: 1 });
      const buildMonsterInfoboxFn = jest.fn();
      jest
        .spyOn(builders, "buildMonsterInfobox")
        .mockImplementationOnce(buildMonsterInfoboxFn);
      await npcInfoboxGenerator({} as any, 1);
      expect(buildMonsterInfoboxFn).toHaveBeenCalled();
    });

    it("should generate npc infobox for an npc without a combat level", async () => {
      jest.spyOn(NPC, "load").mockReturnValue({
        id: 1,
        combatLevel: 0,
      });
      const buildNpcInfoboxFn = jest.spyOn(builders, "buildNpcInfobox");
      await npcInfoboxGenerator({} as any, 1);
      expect(buildNpcInfoboxFn).toHaveBeenCalled();
    });
  });
  describe("buildNpcInfobox", () => {
    it("should build npc infobox", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Do not require all fields
      const builder = await buildNpcInfobox({
        name: "name",
        combatLevel: 1,
        actions: ["action1", "action2"],
        id: 1 as NPCID,
      });
      expect(builder?.build()).toMatchSnapshot();
    });
  });

  describe("buildMonsterInfobox", () => {
    it("should build monster infobox", async () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore Do not require all fields
      const builder = await buildMonsterInfobox({
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
      });
      expect(builder?.build()).toMatchSnapshot();
    });
  });
});
