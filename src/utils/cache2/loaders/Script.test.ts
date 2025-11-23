import { Script } from "./Script";
import { ScriptID } from "../types";
import { Reader } from "../Reader";
import { isStringOpcode, isByteOperandOpcode } from "../script/Opcodes";

describe("Script", () => {
  test("helper methods work correctly", () => {
    expect(isStringOpcode(3)).toBe(true);
    expect(isStringOpcode(21)).toBe(false);

    expect(isByteOperandOpcode(21)).toBe(true);
    expect(isByteOperandOpcode(100)).toBe(true);
    expect(isByteOperandOpcode(50)).toBe(false);
  });
  test("loads basic script structure", () => {
    // Minimal valid script: null + 0 opcodes + metadata + no switches
    const data = new Uint8Array([
      0, // null string
      0,
      0,
      0,
      0, // numOpcodes = 0
      0,
      0, // localIntCount = 0
      0,
      0, // localObjCount = 0
      0,
      0, // intArgCount = 0
      0,
      0, // objArgCount = 0
      0, // numSwitches = 0
      0,
      0, // switchLength = 0
    ]);

    const script = Script.decode(new Reader(data), 100 as ScriptID);

    expect(script.id).toBe(100);
    expect(script.localIntCount).toBe(0);
    expect(script.localObjCount).toBe(0);
    expect(script.intArgCount).toBe(0);
    expect(script.objArgCount).toBe(0);
    expect(script.switches).toBeUndefined();
  });
});
