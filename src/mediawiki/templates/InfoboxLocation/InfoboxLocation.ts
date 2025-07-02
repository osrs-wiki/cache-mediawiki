import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxLocation as InfoboxLocationType } from "./InfoboxLocation.types";

import Context from "@/context";
import { Area } from "@/utils/cache2";

const InfoboxLocation = (location: Area) => {
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
    location: "",
    wilderness: "",
    teleport: "",
    music: "",
    map: "",
    type: "",
  });
};

export default InfoboxLocation;
