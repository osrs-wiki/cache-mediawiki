import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import InfoboxQuestTemplate from "../../templates/InfoboxQuest";
import QuestDetails from "../../templates/QuestDetails";
import QuestRewards from "../../templates/QuestRewards";

import { Quest } from "@/types/quest";

export const questPageBuilder = (quest: Quest): MediaWikiBuilder => {
  const infoboxQuest = InfoboxQuestTemplate(quest);
  const questDetails = QuestDetails(quest);
  const questRewards = QuestRewards(quest);

  const builder = new MediaWikiBuilder();

  builder.addContents([infoboxQuest.build(), new MediaWikiBreak()]);

  // Add quest introduction
  if (quest.displayname) {
    builder.addContents([
      new MediaWikiText(quest.displayname, { bold: true }),
      new MediaWikiText(
        ` is a ${quest.difficulty?.toLowerCase() || ""} quest${
          quest.location ? ` in ${quest.location}` : ""
        }.`
      ),
      new MediaWikiBreak(),
      new MediaWikiBreak(),
    ]);
  }

  // Add quest details
  builder.addContents([
    questDetails,
    new MediaWikiBreak(),
    new MediaWikiBreak(),
  ]);

  // Add walkthrough section
  builder.addContents([
    new MediaWikiHeader("Walkthrough", 2),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
  ]);

  // Add rewards section
  builder.addContents([
    new MediaWikiHeader("Rewards", 2),
    questRewards,
    new MediaWikiBreak(),
    new MediaWikiBreak(),
  ]);

  // Add transcript section
  builder.addContents([
    new MediaWikiHeader("Transcript", 2),
    new MediaWikiTemplate("Hastranscript"),
    new MediaWikiBreak(),
  ]);

  // Add quest series navbox (if applicable)
  if (quest.series && quest.displayname) {
    builder.addContents([
      new MediaWikiBreak(),
      new MediaWikiTemplate(quest.displayname),
    ]);
  }

  return builder;
};
