import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxNpc } from "./InfoboxNpc.types";

import Context from "@/context";
import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

const InfoboxNpcTemplate = (npc: NPC) => {
  const cleanName = stripHtmlTags(npc.name);
  const infoboxData: InfoboxNpc = {
    name: cleanName,
    image: new MediaWikiFile(`${cleanName}.png`, {
      resizing: { width: 120 },
    }),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true,
    level: npc.combatLevel > 0 ? npc.combatLevel.toString() : undefined,
    race: "[[Human]]",
    location: "",
    gender: "Male",
    options: npc.actions.filter((action) => action && action !== "null"),
    map: "No",
    examine: Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
    id: `${Context.beta ? "beta" : ""}${npc.id.toString()}`,
  };

  return new InfoboxTemplate<InfoboxNpc>("NPC", infoboxData);
};

export default InfoboxNpcTemplate;
