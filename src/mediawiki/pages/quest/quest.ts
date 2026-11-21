import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import {
  formatQuestRecommendations,
  formatQuestRequirements,
  formatQuestRewards,
  formatSeries,
} from "./quest.utils";

import Context from "@/context";
import {
  InfoboxQuestTemplate,
  QuestDetailsTemplate,
  QuestRewardsTemplate,
} from "@/mediawiki/templates";
import { Quest } from "@/types/quest";

export const questPageBuilder = (quest: Quest): MediaWikiBuilder => {
  const name = quest.name || quest.sortName || `Quest ${quest.id}`;
  const startCoordinate = quest.startCoordinate;
  const start = quest.startNpcName
    ? `Talk to the [[${quest.startNpcName}]]${
        quest.startAreaName ? ` in [[${quest.startAreaName}]]` : ""
      }.`
    : quest.startObjectName
    ? `Interact with the [[${quest.startObjectName}]]${
        quest.startAreaName ? ` in [[${quest.startAreaName}]]` : ""
      }.`
    : quest.startAreaName
    ? `Start in [[${quest.startAreaName}]].`
    : "";
  const startMap = startCoordinate
    ? `${startCoordinate.x},${startCoordinate.y}${
        startCoordinate.plane ? `,plane:${startCoordinate.plane}` : ""
      }`
    : "";
  const builder = new MediaWikiBuilder();

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

  builder.addContents([
    new MediaWikiTemplate("Has quick guide"),
    InfoboxQuestTemplate({
      name,
      number: "",
      image: new MediaWikiFile(`${name}.png`, {
        resizing: { width: 300 },
      }),
      release: quest.releaseDate
        ? new MediaWikiDate(quest.releaseDate)
        : undefined,
      update: Context.update,
      members: quest.members,
      series: formatSeries(quest),
      developer: "",
    }).build(),
    new MediaWikiText(`'''${name}'''`),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Details", 2),
    new MediaWikiBreak(),
    new QuestDetailsTemplate({
      start,
      startmap: startMap,
      difficulty: quest.difficultyName,
      description: quest.description,
      length: quest.lengthName,
      requirements: formatQuestRequirements(quest),
      items: "",
      recommended: formatQuestRecommendations(quest),
      kills: "",
      members: quest.members,
      leagueRegion: "",
    }).build(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Walkthrough", 2),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiText("'''Congratulations, quest complete!'''"),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Rewards", 2),
    new MediaWikiBreak(),
    new QuestRewardsTemplate({
      name,
      image: new MediaWikiFile(`${name} reward scroll.png`, {
        horizontalAlignment: "center",
      }),
      qp: quest.questPoints,
      rewards: formatQuestRewards(quest),
    }).build(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Transcript", 2),
    new MediaWikiBreak(),
  ]);

  const transcript = new MediaWikiTemplate("hastranscript");
  transcript.add("", "Quest");
  builder.addContent(transcript);
  builder.addContents([new MediaWikiBreak(), new MediaWikiTemplate(name)]);

  return builder;
};

export default questPageBuilder;
