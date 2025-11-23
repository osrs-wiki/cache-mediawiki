import { PerArchiveLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { Opcodes } from "../script/Opcodes";
import { IndexType, ScriptID } from "../types";

/**
 * Client Script (CS2)
 *
 * Decodes CS2 scripts from the ClientScripts index.
 * Scripts are compiled bytecode that runs on the client.
 */
@Typed
export class Script extends PerArchiveLoadable {
  constructor(public id: ScriptID) {
    super();
  }

  public static readonly index = IndexType.ClientScripts;

  public instructions: number[] = [];
  public intOperands: number[] = [];
  public stringOperands: string[] = [];
  public intArgCount = 0;
  public objArgCount = 0;
  public localIntCount = 0;
  public localObjCount = 0;
  public switches?: Map<number, number>[];

  /**
   * Decode a script from raw bytes
   * @param reader Reader containing script data
   * @param id Script ID
   */
  public static decode(reader: Reader, id: ScriptID): Script {
    const script = new Script(id);

    // Read from the end of the file to get metadata
    reader.offset = reader.length - 2;
    const switchLength = reader.u16();

    // Calculate where opcodes end (before metadata section)
    // 2 for switchLength + the switch data + 12 for the param/vars/stack data
    const endIdx = reader.length - 2 - switchLength - 12;
    reader.offset = endIdx;

    const numOpcodes = reader.i32();
    const localIntCount = reader.u16();
    const localObjCount = reader.u16();
    const intArgCount = reader.u16();
    const objArgCount = reader.u16();

    script.localIntCount = localIntCount;
    script.localObjCount = localObjCount;
    script.intArgCount = intArgCount;
    script.objArgCount = objArgCount;

    // Read switch tables
    const numSwitches = reader.u8();
    if (numSwitches > 0) {
      const switches: Map<number, number>[] = [];
      script.switches = switches;

      for (let i = 0; i < numSwitches; i++) {
        const switchMap = new Map<number, number>();
        switches[i] = switchMap;

        const count = reader.u16();
        for (let j = 0; j < count; j++) {
          const key = reader.i32(); // int from stack is compared to this
          const pcOffset = reader.i32(); // pc jumps by this
          switchMap.set(key, pcOffset);
        }
      }
    }

    // Read instructions from the beginning
    reader.offset = 0;
    reader.string(); // Skip null string at start

    const instructions: number[] = new Array(numOpcodes);
    const intOperands: number[] = new Array(numOpcodes);
    const stringOperands: string[] = new Array(numOpcodes);

    script.instructions = instructions;
    script.intOperands = intOperands;
    script.stringOperands = stringOperands;

    // Read all instructions
    for (let i = 0; reader.offset < endIdx; i++) {
      const opcode = reader.u16();
      instructions[i] = opcode;

      switch (opcode) {
        case Opcodes.SCONST:
          stringOperands[i] = reader.string();
          intOperands[i] = 0;
          break;

        case Opcodes.RETURN:
        case Opcodes.POP_INT:
        case Opcodes.POP_OBJECT:
        case Opcodes.PUSH_NULL:
          intOperands[i] = reader.u8();
          stringOperands[i] = "";
          break;

        default:
          if (opcode < 100) {
            intOperands[i] = reader.i32();
          } else {
            intOperands[i] = reader.u8();
          }
          stringOperands[i] = "";
          break;
      }
    }

    return script;
  }
}
