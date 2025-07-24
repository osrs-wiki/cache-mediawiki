import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxMusic } from "./InfoboxMusic.types";
import { formatDuration, isQuestTrack } from "./InfoboxMusic.utils";

import Context from "@/context";
import { MusicTrack } from "@/types/music";

const InfoboxMusicTemplate = (musicTrack: MusicTrack) => {
  const trackName =
    musicTrack.displayName || musicTrack.sortName || `Track ${musicTrack.id}`;

  const infoboxData: InfoboxMusic = {
    name: trackName,
    number: undefined,
    file: new MediaWikiFile(`${trackName}.ogg`),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true,
    location: undefined,
    hint: musicTrack.unlockHint
      ? `This track unlocks ${musicTrack.unlockHint}`
      : undefined,
    quest: isQuestTrack(musicTrack.unlockHint) ? "Yes" : "No",
    duration: formatDuration(musicTrack.duration),
    composer: undefined,
    map: undefined,
  };

  return new InfoboxTemplate<InfoboxMusic>("Music", infoboxData);
};

export default InfoboxMusicTemplate;
