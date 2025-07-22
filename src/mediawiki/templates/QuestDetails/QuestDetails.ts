import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { Quest } from "@/types/quest";

const QuestDetails = (quest: Quest): MediaWikiTemplate => {
  const params: Record<string, string | number | boolean | undefined> = {
    start: quest.startloc
      ? `Speak to someone at the [[${quest.startloc}]].`
      : undefined,
    startmap:
      quest.startcoord && quest.startcoord.includes(",")
        ? quest.startcoord
        : undefined,
    difficulty: quest.difficulty || undefined,
    description: quest.location
      ? `A ${quest.difficulty.toLowerCase()} quest in ${quest.location}.`
      : undefined,
    length: quest.length || undefined,
    requirements: quest.requirementStats || undefined,
    recommended: quest.recommendedStats || undefined,
  };

  return new MediaWikiTemplate("Quest details", params);
};

export default QuestDetails;
