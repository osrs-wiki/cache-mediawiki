import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

import { InfoboxScenery, InfoboxSceneryOptions } from "./InfoboxScenery.types";
import { InfoboxTemplate } from "../InfoboxTemplate";

import Context from "@/context";
import { Obj } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

/**
 * Creates InfoboxScenery data for a single scenery object
 */
const createInfoboxSceneryData = (
  scenery: Obj,
  options?: InfoboxSceneryOptions
): InfoboxScenery => {
  const cleanName = stripHtmlTags(scenery.name);

  return {
    name: cleanName,
    image: new MediaWikiFile(`${cleanName}.png`, { resizing: { width: 220 } }),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true,
    quest: "No",
    location: options?.location,
    map: options?.map,
    options: scenery.actions,
    examine: Context.examines?.scenery
      ? Context.examines.scenery[scenery.id]
      : "",
    id: `${Context.beta ? "beta" : ""}${scenery.id.toString()}`,
  };
};

const InfoboxSceneryTemplate = (
  scenery: Obj,
  options?: InfoboxSceneryOptions
) => {
  const infoboxData = createInfoboxSceneryData(scenery, options);
  return new InfoboxTemplate<InfoboxScenery>("Scenery", infoboxData);
};

export default InfoboxSceneryTemplate;
