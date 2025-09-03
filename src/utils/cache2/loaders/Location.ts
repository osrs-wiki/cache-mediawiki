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
}
