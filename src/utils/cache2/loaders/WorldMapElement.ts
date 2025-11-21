import { Position } from "./Position";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import { AreaID, WorldX, WorldY } from "../types";

/**
 * Represents a world map element (icon/marker) that appears on the world map.
 * Each element has a position, optional offset, and references an area definition.
 */
@Typed
export class WorldMapElement {
  public position!: Position;
  public offset: Position | null = null;
  public areaDefinitionId = <AreaID>-1;
  public membersOnly = false;

  /**
   * Decodes a WorldMapElement from a Reader stream.
   *
   * @param r The Reader to decode from
   * @returns A decoded WorldMapElement instance
   */
  public static decodeFromStream(r: Reader): WorldMapElement {
    const v = new WorldMapElement();

    v.areaDefinitionId = <AreaID>r.s2o4n();
    v.position = Position.fromPacked(r.i32());
    v.membersOnly = r.u8() === 1;

    return v;
  }

  /**
   * Gets the world position of this element, applying the offset if it exists.
   * The offset is calculated based on the element's position within map squares/zones.
   *
   * @returns The element's position in world coordinates
   */
  public getWorldPosition(): Position {
    if (this.offset === null) {
      return new Position(this.position.x, this.position.y, 0);
    }

    return new Position(
      (this.position.x + this.offset.x) as WorldX,
      (this.position.y + this.offset.y) as WorldY,
      this.offset.z
    );
  }
}
