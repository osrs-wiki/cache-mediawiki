/**
 * Represents a music track from DB table 44
 */
export type MusicTrack = {
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
  /** MIDI file reference (optional) */
  midi?: string | number | bigint;
  /** Variables/parameters (optional) */
  variables?: (string | number | bigint)[];
  /** Areas/regions where track plays (optional) */
  areas?: (string | number | bigint)[];
  /** Additional metadata (optional) */
  metadata?: (string | number | bigint)[];
  /** Additional data columns (optional) */
  extraData?: (string | number | bigint)[][];
}