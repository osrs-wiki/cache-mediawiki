import { Reader } from "../Reader";
import { Typed } from "../reflect";

/**
 * Represents an 8x8 tile zone definition used in world map composites.
 * Maps a source zone location (within a square) to a display zone location.
 * Provides more granular control than MapSquare for specific regions.
 */
@Typed
export class Zone {
  public minLevel = 0;
  public levels = 0;
  public sourceSquareX = 0;
  public sourceSquareZ = 0;
  public sourceZoneX = 0;
  public sourceZoneZ = 0;
  public displaySquareX = 0;
  public displaySquareZ = 0;
  public displayZoneX = 0;
  public displayZoneZ = 0;
  public groupId = 0;
  public fileId = 0;

  /**
   * Decodes a Zone from a Reader stream.
   * The stream must start with a type byte of 1.
   *
   * @param r The Reader to decode from
   * @returns A decoded Zone instance
   * @throws Error if the worldMapDataType is not 1
   */
  public static decodeFromStream(r: Reader): Zone {
    const worldMapDataType = r.u8();
    if (worldMapDataType !== 1) {
      throw new Error(`Expected worldMapDataType 1 got ${worldMapDataType}`);
    }

    const v = new Zone();
    v.minLevel = r.u8();
    v.levels = r.u8();
    v.sourceSquareX = r.u16();
    v.sourceSquareZ = r.u16();
    v.sourceZoneX = r.u8();
    v.sourceZoneZ = r.u8();
    v.displaySquareX = r.u16();
    v.displaySquareZ = r.u16();
    v.displayZoneX = r.u8();
    v.displayZoneZ = r.u8();
    v.groupId = r.s2o4n();
    v.fileId = r.s2o4n();

    return v;
  }
}
