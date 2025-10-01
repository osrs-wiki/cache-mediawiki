import { Typed } from "../reflect";
import { WorldX, WorldY } from "../types";

@Typed
export class Position {
  constructor(
    public readonly x: WorldX,
    public readonly y: WorldY,
    public readonly z: number
  ) {}

  public static fromPacked(packedPosition: number): Position {
    if (packedPosition === -1) {
      return new Position(-1 as WorldX, -1 as WorldY, -1);
    }

    const z = (packedPosition >> 28) & 3;
    const x = (packedPosition >> 14) & 16383;
    const y = packedPosition & 16383;

    return new Position(x as WorldX, y as WorldY, z);
  }

  public getX(): WorldX {
    return this.x;
  }
  public getY(): WorldY {
    return this.y;
  }
  public getZ(): number {
    return this.z;
  }

  /**
   * Compares this position with another to determine if they are identical.
   *
   * @param other The other position to compare against
   * @returns true if the positions are identical, false otherwise
   */
  public equals(other: Position): boolean {
    if (!other) {
      return false;
    }

    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
}
