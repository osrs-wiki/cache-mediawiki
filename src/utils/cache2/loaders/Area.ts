import { PerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { AreaID } from "../types";

@Typed
export class Area extends PerFileLoadable {
  constructor(public id: AreaID) {
    super();
  }

  public static readonly index = 2;
  public static readonly archive = 35;

  public field3292: number[];
  public spriteId = -1;
  public field3294 = -1;
  public name: string;
  public textColor: number;
  public category = -1;
  public field3298: (string | null)[] = [null, null, null, null, null];
  public field3300: number[];
  public field3308: string;
  public field3309: number[];
  public textScale: number;

  public static decode(r: Reader, id: AreaID): Area {
    const v = new Area(id);
    for (let opcode: number; (opcode = r.u8()) != 0; ) {
      switch (opcode) {
        case 1:
          v.spriteId = r.s2o4n();
          break;
        case 2:
          v.field3294 = r.s2o4n();
        case 3:
          v.name = r.string().replaceAll("<br>", " ");
          break;
        case 4:
          v.textColor = r.u24();
          break;
        case 5:
          r.u24();
          break;
        case 6:
          v.textScale = r.u8();
          break;
        case 7:
          r.u8();
          break;
        case 8:
          r.u8();
          break;
        case 10:
        case 11:
        case 12:
        case 13:
        case 14:
          v.field3298[opcode - 10] = r.string();
          break;
        case 15:
          const len = r.u8();
          v.field3300 = new Array(len * 2).fill(0);
          for (let i = 0; i < len * 2; i++) {
            v.field3300[i] = r.u16();
          }
          r.u24();
          const len2 = r.u8();
          v.field3292 = new Array(len2).fill(0);
          for (let i = 0; i < v.field3292.length; i++) {
            v.field3292[i] = r.u24();
          }

          v.field3309 = new Array(len).fill(0);
          for (let i = 0; i < len; i++) {
            v.field3309[i] = r.u8();
          }
          break;
        case 16:
          break;
        case 17:
          v.field3308 = r.string();
          break;
        case 18:
          r.s2o4n();
          break;
        case 19:
          v.category = r.u16();
          break;
        case 21:
          r.u24();
          break;
        case 22:
          r.u24();
          break;
        case 23:
          r.u8();
          r.u8();
          r.u8();
          break;
        case 24:
          r.u16();
          r.u16();
          break;
        case 25:
          r.s2o4n();
          break;
        case 28:
          r.u8();
          break;
        case 29:
          r.bump(1);

          break;
        case 30:
          r.bump(1);
          break;
        default:
          throw new Error(`unknown opcode ${opcode}`);
      }
    }
    return v;
  }
}
