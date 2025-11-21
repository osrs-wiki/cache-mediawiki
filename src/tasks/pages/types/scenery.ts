import Context from "../../../context";
import { renderScenery } from "../../renders";
import { writePageToFile } from "../pages.utils";

import { sceneryPageBuilder } from "@/mediawiki/pages/scenery";
import { CacheProvider, Obj } from "@/utils/cache2";

export const writeSceneryPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const scenery = await Obj.load(cache, id);

    if (scenery) {
      writeSceneryPage(scenery, cache);
    }
  } catch (e) {
    console.error(`Error generating page for scenery ${id}: `, e);
  }
};

export const writeSceneryPage = async (
  scenery: Obj,
  cache?: Promise<CacheProvider>
) => {
  const builder = await sceneryPageBuilder(scenery, cache);
  writePageToFile(builder, "scenery", scenery.name, scenery.id.toString());

  if (Context.renders) {
    renderScenery(scenery);
  }
};
