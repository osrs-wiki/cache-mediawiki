import { MusicTrack } from "@/types/music";
import { DBRow } from "@/utils/cache2";

/**
 * Helper function to format duration from seconds to MM:SS
 * @param seconds Duration in seconds
 * @returns Formatted duration string in MM:SS format or undefined if invalid
 */
export const formatDuration = (seconds?: number): string | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Helper function to detect if this is a quest track
 * @param hint The unlock hint text
 * @returns True if the track is related to a quest
 */
export const isQuestTrack = (hint?: string): boolean => {
  if (!hint) return false;
  return hint.toLowerCase().includes('quest');
};

/**
 * Convert DBRow from table 44 to MusicTrack
 * @param dbRow The DBRow to convert
 * @returns MusicTrack representation
 */
export const dbRowToMusicTrack = (dbRow: DBRow): MusicTrack => {
  const values = dbRow.values;
  
  return {
    sortName: values[0]?.[0] as string || "",
    displayName: values[1]?.[0] as string || "",
    unlockHint: values[2]?.[0] as string || "",
    duration: values[3]?.[0] as number || 0,
    id: dbRow.id,
  };
};