import {
  MediaWikiBuilder,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import InfoboxMusicTemplate from "@/mediawiki/templates/InfoboxMusic";
import { DBRow } from "@/utils/cache2";

export const musicPageBuilder = (dbRow: DBRow) => {
  const infoboxMusic = InfoboxMusicTemplate(dbRow);
  
  // Parse DBRow values to get track name and unlock hint
  const values = dbRow.values;
  const displayName = values[1]?.[0] as string;
  const sortName = values[0]?.[0] as string;
  const unlockHint = values[2]?.[0] as string;
  const trackName = displayName || sortName || `Track ${dbRow.id}`;

  const builder = new MediaWikiBuilder();
  builder.addContents([
    new MediaWikiTemplate("New Content"),
    infoboxMusic.build(),
    new MediaWikiText(trackName, { bold: true }),
    new MediaWikiText(" is a "),
    new MediaWikiText("[[music]]"),
    new MediaWikiText(" track"),
  ]);
  
  // Add unlock location information if available in the hint
  if (unlockHint) {
    builder.addContents([
      new MediaWikiText(" that is unlocked "),
      new MediaWikiText(unlockHint.toLowerCase()),
    ]);
  }
  
  builder.addContents([
    new MediaWikiText("."),
    new MediaWikiTemplate("Music"),
    new MediaWikiText("[[Category:Old School-exclusive music]]"),
  ]);

  return builder;
};

export default musicPageBuilder;