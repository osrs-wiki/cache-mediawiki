import { writePageToFile } from "../pages.utils";

import { musicPageBuilder } from "@/mediawiki/pages/music";
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
  // Parse DBRow values to get track name
  const values = dbRow.values;
  const displayName = values[1]?.[0] as string;
  const sortName = values[0]?.[0] as string;
  const trackName = displayName || sortName || `Track ${dbRow.id}`;

  const builder = musicPageBuilder(dbRow);
  writePageToFile(builder, "music", trackName, dbRow.id.toString());
};