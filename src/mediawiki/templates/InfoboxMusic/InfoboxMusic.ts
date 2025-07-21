import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxMusic } from "./InfoboxMusic.types";

import Context from "@/context";
import { DBRow } from "@/utils/cache2";

// Helper function to format duration from seconds to MM:SS
const formatDuration = (seconds?: number): string | undefined => {
  if (!seconds || seconds <= 0) return undefined;
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to detect if this is a quest track
const isQuestTrack = (hint?: string): boolean => {
  if (!hint) return false;
  return hint.toLowerCase().includes('quest');
};

const InfoboxMusicTemplate = (dbRow: DBRow) => {
  // Parse DBRow values according to table 44 structure
  const values = dbRow.values;
  
  const sortName = values[0]?.[0] as string;
  const displayName = values[1]?.[0] as string;
  const unlockHint = values[2]?.[0] as string;
  const duration = values[3]?.[0] as number;
  
  // Use display name if available, otherwise fallback to sort name
  const trackName = displayName || sortName || `Track ${dbRow.id}`;
  
  const infoboxData: InfoboxMusic = {
    name: trackName,
    number: undefined, // Not provided in the data structure
    file: new MediaWikiFile(`${trackName}.ogg`),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true, // Assuming members content by default
    location: undefined, // Would need additional mapping
    hint: unlockHint || undefined,
    quest: isQuestTrack(unlockHint) ? "Yes" : "No",
    duration: formatDuration(duration),
    composer: undefined, // Not provided in the data structure
    map: undefined, // Not provided in the data structure
  };

  return new InfoboxTemplate<InfoboxMusic>("Music", infoboxData);
};

export default InfoboxMusicTemplate;