import {
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxLocation as InfoboxLocationType } from "./InfoboxLocation.types";
import { InfoboxTemplate } from "../InfoboxTemplate";

import Context from "@/context";
import { Area } from "@/utils/cache2";

const InfoboxLocation = (
  location: Area,
  mapTemplate?: MediaWikiTemplate,
  nearestLocation?: MediaWikiLink
) => {
  return new InfoboxTemplate<InfoboxLocationType>("Location", {
    name: location.name as string,
    image: new MediaWikiFile(`${location.name}.png`, {
      resizing: { width: 300 },
    }),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: "Yes",
    ...(nearestLocation && { location: nearestLocation }),
    ...(!nearestLocation && { location: "" }),
    wilderness: "",
    teleport: "",
    music: "",
    ...(mapTemplate && { map: mapTemplate }),
    type: "",
  });
};

export default InfoboxLocation;
