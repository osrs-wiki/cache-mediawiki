import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { Quest } from "@/types/quest";

const QuestRewards = (quest: Quest): MediaWikiTemplate => {
  const params: Record<string, string | number | boolean | undefined> = {
    name: quest.displayname || undefined,
    image: quest.displayname
      ? `[[File:${quest.displayname} rewards scroll.png]]`
      : undefined,
    qp: quest.questpoints > 0 ? quest.questpoints : undefined,
    rewards:
      quest.totalXpAwarded > 0
        ? `Total XP awarded: ${quest.totalXpAwarded.toLocaleString()}`
        : undefined,
  };

  return new MediaWikiTemplate("Quest rewards", params);
};

export default QuestRewards;
