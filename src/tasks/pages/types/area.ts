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
      console.log(`Area: `, JSON.stringify(area, null, 2));
      writeAreaPage(area);
    } else {
      console.warn(`Area with ID ${id} not found.`);
    }
  } catch (e) {
    console.error(`Error generating page for area ${id}: `, e);
  }
};

export const writeAreaPage = async (area: Area) => {
  const builder = areaPageBuilder(area);
  writePageToFile(builder, "area", area.name, area.id.toString());
};
