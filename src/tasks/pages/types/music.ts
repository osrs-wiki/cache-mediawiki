import { writePageToFile } from "../pages.utils";

import { musicPageBuilder } from "@/mediawiki/pages/music";
import { dbRowToMusicTrack } from "@/mediawiki/templates/InfoboxMusic/InfoboxMusic.utils";
import { CacheProvider, DBRow } from "@/utils/cache2";

export const writeMusicPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const dbRow = await DBRow.load(cache, id);

    if (dbRow && dbRow.table === 44) {
      writeMusicPage(dbRow);
    }
  } catch (e) {
    console.error(`Error generating page for music track ${id}: `, e);
  }
};

export const writeMusicPage = async (dbRow: DBRow) => {
  const musicTrack = dbRowToMusicTrack(dbRow);
  const trackName = musicTrack.displayName || musicTrack.sortName || `Track ${musicTrack.id}`;

  const builder = musicPageBuilder(musicTrack);
  writePageToFile(builder, "music", trackName, musicTrack.id.toString());
};