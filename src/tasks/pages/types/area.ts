import { writePageToFile } from "../pages.utils";

import { areaPageBuilder } from "@/mediawiki/pages/area";
import { Area, CacheProvider } from "@/utils/cache2";

export const writeAreaPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const area = await Area.load(cache, id);

    if (area) {
      await writeAreaPage(area, cache);
    } else {
      console.warn(`Area with ID ${id} not found.`);
    }
  } catch (e) {
    console.error(`Error generating page for area ${id}: `, e);
  }
};

export const writeAreaPage = async (
  area: Area,
  cache?: Promise<CacheProvider>
) => {
  const builder = await areaPageBuilder(area, cache);
  writePageToFile(builder, "area", area.name, area.id.toString());
};
