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
}
