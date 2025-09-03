import { Typed } from "../reflect";
import {
  TileHeight,
  TileSettings,
  OverlayID,
  OverlayPath,
  OverlayRotation,
  UnderlayID,
} from "../types";

@Typed
export class Tile {
  public height?: TileHeight;
  public attrOpcode = 0;
  public settings: TileSettings = 0 as TileSettings;
  public overlayId: OverlayID = 0 as OverlayID;
  public overlayPath: OverlayPath = 0 as OverlayPath;
  public overlayRotation: OverlayRotation = 0 as OverlayRotation;
  public underlayId: UnderlayID = 0 as UnderlayID;

  public getHeight(): TileHeight | undefined {
    return this.height;
  }

  public getOverlayId(): OverlayID {
    return this.overlayId;
  }

  public getOverlayPath(): OverlayPath {
    return this.overlayPath;
  }

  public getOverlayRotation(): OverlayRotation {
    return this.overlayRotation;
  }

  public getSettings(): TileSettings {
    return this.settings;
  }

  public getUnderlayId(): UnderlayID {
    return this.underlayId;
  }
}
