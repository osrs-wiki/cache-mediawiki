import { PerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { ConfigType, IndexType, VarbitID } from "../types";

@Typed
export class Varbit extends PerFileLoadable {
  constructor(public id: VarbitID) {
    super();
  }

  public static readonly index = IndexType.Configs;
  public static readonly archive = ConfigType.VarPlayer;

  public index: number;
  public leastSignificantBit: number;
  public mostSignificantBit: number;

  public static decode(r: Reader, id: VarbitID): Varbit {
    const v = new Varbit(id);
    for (let opcode: number; (opcode = r.u8()) != 0; ) {
      switch (opcode) {
        case 1:
          v.index = r.u16();
          v.leastSignificantBit = r.u8();
          v.mostSignificantBit = r.u8();
          break;
        default:
          throw new Error(`unknown opcode ${opcode}`);
      }
    }
    return v;
  }
}
