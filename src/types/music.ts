/**
 * Represents a music track from DB table 44
 */
export interface MusicTrack {
  /** The internal sort name of the track */
  sortName: string;
  /** The display name of the track */
  displayName: string;
  /** Hint text for unlocking the track */
  unlockHint: string;
  /** Duration of the track in seconds */
  duration: number;
  /** The unique ID of the track */
  id: number;
}