import { getChangedResult } from "./file.utils";
import { NPC } from "../../../utils/cache2";

describe("file utils", () => {
  describe("getChangedResult", () => {
    test("type: string", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            name: "test",
          },
          {
            name: "test2",
          }
        )
      ).toEqual({
        name: {
          oldValue: "test",
          newValue: "test2",
        },
      });
    });

    test("type: new string", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            name: null,
          },
          {
            name: "test2",
          }
        )
      ).toEqual({
        name: {
          oldValue: null,
          newValue: "test2",
        },
      });
    });

    test("type: number", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            combatLevel: 50,
          },
          {
            combatLevel: 100,
          }
        )
      ).toEqual({
        combatLevel: {
          oldValue: 50,
          newValue: 100,
        },
      });
    });

    test("type: new number", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            combatLevel: null,
          },
          {
            combatLevel: 100,
          }
        )
      ).toEqual({
        combatLevel: {
          oldValue: null,
          newValue: 100,
        },
      });
    });

    test("type: array added elements", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, null, null, null],
          },
          {
            actions: ["Talk", null, "Trade", null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, null, null, null],
          newValue: ["Talk", null, "Trade", null, null],
        },
      });
    });

    test("type: array removed elements", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, "Trade", null, null],
          },
          {
            actions: ["Talk", null, null, null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, "Trade", null, null],
          newValue: ["Talk", null, null, null, null],
        },
      });
    });

    test("type: new array", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: null,
          },
          {
            actions: ["Talk", null, null, null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: null,
          newValue: ["Talk", null, null, null, null],
        },
      });
    });

    test("type: removed array", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, null, null, null],
          },
          {
            actions: null,
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, null, null, null],
          newValue: null,
        },
      });
    });
  });
});
