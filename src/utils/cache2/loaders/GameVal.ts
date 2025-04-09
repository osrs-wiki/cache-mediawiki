import { CacheProvider } from "../Cache";
import { Loadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { GameValID, GameValType } from "../types";

const decoder = new TextDecoder("utf-8");

export class GameVal extends Loadable {
  constructor(public gameValID: GameValID, public otherID: number) {
    super();
  }

  public declare [Typed.type]: Typed.Any;

  public static readonly index = 24;

  public name!: string;
  public files?: Map<number, string> = undefined;

  public static async loadData(
    cache: CacheProvider,
    gameValID: GameValID,
    otherID: number
  ): Promise<Reader | undefined> {
    const archive = await cache.getArchive(this.index, gameValID);
    const version = await cache.getVersion(this.index);
    const data = archive?.getFile(otherID + 1)?.data;
    return data ? new Reader(data, version) : undefined;
  }

  public static async nameFor(
    cache: CacheProvider | Promise<CacheProvider>,
    obj: { id: number }
  ): Promise<string | undefined> {
    const clazz = obj?.constructor;
    if (clazz && "gameval" in clazz) {
      const gv = await this.load(cache, clazz.gameval, obj.id);
      return gv?.name;
    }
    return undefined;
  }

  public static decode(
    r: Reader,
    gameValID: GameValID,
    otherID: number
  ): GameVal;
  public static decode(
    r: Reader,
    gameValID: GameValID,
    otherID: number
  ): GameVal {
    const v = new GameVal(gameValID, otherID);

    switch (gameValID) {
      case GameValType.DBTables: {
        r.u8();

        v.name = r.string();
        const files = (v.files = new Map());

        for (let id = 0; ; id++) {
          const counter = r.u8();
          if (counter == 0) {
            break;
          }

          files.set(id, r.string());
        }
        break;
      }
      case GameValType.Interfaces: {
        v.name = r.string();
        const files = (v.files = new Map());

        for (;;) {
          const id = r.u8();
          if (id == 255) {
            break;
          }

          files.set(id, r.string());
        }
        break;
      }
      default:
        v.name = decoder.decode(r.dataView);
    }

    return v;
  }

  public static all(
    cache: CacheProvider | Promise<CacheProvider>
  ): Promise<Map<GameValID, Map<number, GameVal>>>;
  public static all(
    cache: CacheProvider | Promise<CacheProvider>,
    id: GameValID
  ): Promise<Map<number, GameVal>>;
  public static async all(
    cache: CacheProvider | Promise<CacheProvider>,
    id?: GameValID
  ): Promise<unknown> {
    const c = await cache;

    if (id === undefined) {
      const ids = await c.getArchives(this.index);
      if (!ids) {
        return undefined;
      }

      return new Map(
        await Promise.all(
          ids.map((id) =>
            this.all(c, id as GameValID).then((v) => [id, v] as const)
          )
        )
      );
    }

    const version = await c.getVersion(this.index);

    const ar = await c.getArchive(this.index, id);
    if (!ar) {
      return undefined;
    }

    return new Map(
      Array.from(ar.getFiles().entries()).map(([fid, file]) => {
        try {
          return [fid, this.decode(new Reader(file.data, version), id, fid)];
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const ea = e as Error;
            ea.message = `${id}:${fid}: ${ea.message}`;
          }
          throw e;
        }
      })
    );
  }
}
