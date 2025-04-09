import { ArchivePerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { GameValID, GameValType, IndexType } from "../types";

@Typed
export class GameVal extends ArchivePerFileLoadable {
  constructor(public gameValId: number, public id: GameValID) {
    super();
  }

  public static readonly index = IndexType.GameVals;

  public name: string;
  public files: Record<number, string>;

  public static decode(r: Reader, gameValId: number, id: GameValID): GameVal {
    const v = new GameVal(gameValId, id);

    if (gameValId == GameValType.DbTables) {
      r.u8();
      v.name = r.string();
      v.files = {};

      for (let iid = 0; ; iid++) {
        const counter = r.u8();
        if (counter == 0) {
          break;
        }

        v.files[iid] = r.string();
      }
    } else if (gameValId == GameValType.Interfaces) {
      v.name = r.string();
      v.files = {};

      for (;;) {
        const iid = r.u8();
        if (iid == 0xff) {
          break;
        }

        v.files[iid] = r.string();
      }
    } else {
      const decoder = new TextDecoder("utf-8");
      v.name = decoder.decode(r.buffer);
    }
    return v;
  }
}
