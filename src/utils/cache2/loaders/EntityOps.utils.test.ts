import { EntityOps } from "./EntityOps";
import { getEntityOpsActions } from "./EntityOps.utils";
import { Reader } from "../Reader";

describe("EntityOps utils", () => {
  test("getEntityOpsActions - no ops", () => {
    expect(getEntityOpsActions(undefined)).toEqual([]);
  });

  test("getEntityOpsActions - no sub ops", () => {
    const ops = new EntityOps();
    ops.set(1, { text: "Talk-to" });
    ops.set(2, { text: null });

    expect(getEntityOpsActions(ops)).toEqual(["Talk-to"]);
  });

  test("getEntityOpsActions - filters out 'null' text", () => {
    const ops = new EntityOps();
    ops.set(1, { text: "Attack" });
    ops.set(2, { text: "null" });

    expect(getEntityOpsActions(ops)).toEqual(["Attack"]);
  });

  test("getEntityOpsActions - with sub ops", () => {
    const ops = new EntityOps();
    const subs = new EntityOps();
    subs.set(0, { text: "Sub Action 1" });
    subs.set(1, { text: "Sub Action 2" });
    ops.set(1, { text: "Action 1", subs });
    ops.set(2, { text: "Action 2" });

    expect(getEntityOpsActions(ops)).toEqual([
      "Action 1 (Sub Action 1, Sub Action 2)",
      "Action 2",
    ]);
  });

  test("getEntityOpsActions - sub ops with null text are filtered out", () => {
    const ops = new EntityOps();
    const subs = new EntityOps();
    subs.set(0, { text: "Sub Action 1" });
    subs.set(1, { text: null });
    subs.set(2, { text: "null" });
    ops.set(1, { text: "Action 1", subs });

    expect(getEntityOpsActions(ops)).toEqual(["Action 1 (Sub Action 1)"]);
  });

  test("getEntityOpsActions - conditional parent labels decoded from cache", () => {
    const ops = new EntityOps();
    const data = new Uint8Array([
      1,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      ...Buffer.from("Conditional action\0"),
    ]);

    ops.decodeConditionalOp(new Reader(data));

    expect(getEntityOpsActions(ops)).toEqual([
      "Conditional action (conditional)",
    ]);
  });

  test("getEntityOpsActions - conditional sub-option labels decoded from cache", () => {
    const ops = new EntityOps();
    const data = new Uint8Array([
      1,
      0,
      1,
      255,
      255,
      255,
      255,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      ...Buffer.from("Conditional sub-option\0"),
    ]);

    ops.decodeConditionalSubOp(new Reader(data));

    expect(getEntityOpsActions(ops)).toEqual([
      "Conditional sub-option (conditional)",
    ]);
  });
});
