import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "../../../context";

import InfoboxMusicTemplate from "@/mediawiki/templates/InfoboxMusic";
import { MusicTrack } from "@/types/music";

export const musicPageBuilder = (musicTrack: MusicTrack) => {
  const infoboxMusic = InfoboxMusicTemplate(musicTrack);

  const trackName =
    musicTrack.displayName || musicTrack.sortName || `Track ${musicTrack.id}`;

  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([
    infoboxMusic.build(),
    new MediaWikiText(trackName, { bold: true }),
    new MediaWikiText(" is a [[music]] track"),
  ]);

  // Add unlock location information if available in the hint
  if (musicTrack.unlockHint) {
    builder.addContents([
      new MediaWikiText(" that is unlocked "),
      new MediaWikiText(musicTrack.unlockHint),
    ]);
  } else {
    builder.addContent(new MediaWikiText("."));
  }

  builder.addContents([
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiTemplate("Music"),
    new MediaWikiText("[[Category:Old School-exclusive music]]"),
  ]);

  return builder;
};

export default musicPageBuilder;
