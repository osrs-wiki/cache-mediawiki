import { InfoboxTemplate } from "@osrs-wiki/mediawiki-builder";

import { InfoboxQuest } from "./InfoboxQuest.types";
import {
  formatQuestSeries,
  formatReleaseDate,
  formatQuestImage,
} from "./InfoboxQuest.utils";

import Context from "@/context";
import { Quest } from "@/types/quest";

const InfoboxQuestTemplate = (quest: Quest): InfoboxTemplate<InfoboxQuest> => {
  const infoboxData: InfoboxQuest = {
    name: quest.displayname || undefined,
    number: quest.id > 0 ? quest.id : undefined,
    image: formatQuestImage(quest),
    release: formatReleaseDate(quest.releasedate),
    update: Context.update || undefined,
    members:
      quest.members !== undefined ? (quest.members ? "Yes" : "No") : undefined,
    series: formatQuestSeries(quest),
    difficulty: quest.difficulty || undefined,
    length: quest.length || undefined,
    type: quest.type || undefined,
    qp: quest.questpoints > 0 ? quest.questpoints : undefined,
    location: quest.location || undefined,
  };

  return new InfoboxTemplate<InfoboxQuest>("Quest", infoboxData);
};

export default InfoboxQuestTemplate;
