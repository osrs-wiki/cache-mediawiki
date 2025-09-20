import { Position } from "./Position";
import { Typed } from "../reflect";
import { LocationID, LocationType, LocationOrientation } from "../types";

@Typed
export class Location {
  constructor(
    private readonly id: LocationID,
    private readonly type: LocationType,
    private readonly orientation: LocationOrientation,
    private readonly position: Position
  ) {}

  public getId(): LocationID {
    return this.id;
  }
  public getType(): LocationType {
    return this.type;
  }
  public getOrientation(): LocationOrientation {
    return this.orientation;
  }
  public getPosition(): Position {
    return this.position;
  }

  /**
   * Compares this location with another to determine if they are identical.
   *
   * @param other The other location to compare against
   * @returns true if the locations are identical, false otherwise
   */
  public equals(other: Location): boolean {
    if (!other) {
      return false;
    }

    return (
      this.id === other.id &&
      this.type === other.type &&
      this.orientation === other.orientation &&
      this.position.equals(other.position)
    );
  }
}
