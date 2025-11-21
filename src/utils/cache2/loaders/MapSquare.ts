import { Reader } from "../Reader";
import { Typed } from "../reflect";

/**
 * Represents a 64x64 tile map square definition used in world map composites.
 * Maps a source square location to a display square location.
 */
@Typed
export class MapSquare {
  public minLevel = 0;
  public levels = 0;
  public sourceSquareX = 0;
  public sourceSquareZ = 0;
  public displaySquareX = 0;
  public displaySquareZ = 0;
  public groupId = 0;
  public fileId = 0;

  /**
   * Decodes a MapSquare from a Reader stream.
   * The stream must start with a type byte of 0.
   *
   * @param r The Reader to decode from
   * @returns A decoded MapSquare instance
   * @throws Error if the worldMapDataType is not 0
   */
  public static decodeFromStream(r: Reader): MapSquare {
    const worldMapDataType = r.u8();
    if (worldMapDataType !== 0) {
      throw new Error(`Expected worldMapDataType 0 got ${worldMapDataType}`);
    }

    const v = new MapSquare();
    v.minLevel = r.u8();
    v.levels = r.u8();
    v.sourceSquareX = r.u16();
    v.sourceSquareZ = r.u16();
    v.displaySquareX = r.u16();
    v.displaySquareZ = r.u16();
    v.groupId = r.s2o4n();
    v.fileId = r.s2o4n();

    return v;
  }
}
