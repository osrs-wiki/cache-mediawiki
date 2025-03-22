import { PerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { ConfigType, IndexType, SpotAnimID } from "../types";

@Typed
export class SpotAnim extends PerFileLoadable {
  constructor(public id: SpotAnimID) {
    super();
  }

  public static readonly index = IndexType.Configs;
  public static readonly archive = ConfigType.SpotAnim;

  public rotaton = 0;
  public textureToReplace: number[];
  public textureToFind: number[];
  public resizeY = 128;
  public animationId = -1;
  public recolorToFind: number[];
  public recolorToReplace: number[];
  public resizeX = 128;
  public modelId: number;
  public ambient = 0;
  public contrast = 0;

  public static decode(r: Reader, id: SpotAnimID): SpotAnim {
    const v = new SpotAnim(id);
    for (let opcode: number; (opcode = r.u8()) != 0; ) {
      switch (opcode) {
        case 1:
          v.modelId = r.u16();
          break;
        case 2:
          v.animationId = r.u16();
          break;
        case 4:
          v.resizeX = r.u16();
          break;
        case 5:
          v.resizeY = r.u16();
          break;
        case 6:
          v.rotaton = r.u16();
          break;
        case 7:
          v.ambient = r.u8();
          break;
        case 8:
          v.contrast = r.u8();
          break;
        case 40:
          const length = r.u8();
          v.recolorToFind = new Array(length);
          v.recolorToReplace = new Array(length);
          for (let i = 0; i < length; i++) {
            v.recolorToFind[i] = r.u16();
            v.recolorToReplace[i] = r.u16();
          }
          break;
        case 41:
          const length2 = r.u8();
          v.textureToFind = new Array(length2);
          v.textureToReplace = new Array(length2);
          for (let i = 0; i < length2; i++) {
            v.textureToFind[i] = r.u16();
            v.textureToReplace[i] = r.u16();
          }
          break;
        default:
          throw new Error(`unknown opcode ${opcode}`);
      }
    }
    return v;
  }
}
