import { PerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { ConfigType, GameValType, IndexType, VarPID } from "../types";

@Typed
export class VarPlayer extends PerFileLoadable {
  constructor(public id: VarPID) {
    super();
  }

  public static readonly index = IndexType.Configs;
  public static readonly archive = ConfigType.VarPlayer;
  public static readonly gameval = GameValType.Varps;

  public static decode(r: Reader, id: VarPID): VarPlayer {
    const v = new VarPlayer(id);
    return v;
  }
}
