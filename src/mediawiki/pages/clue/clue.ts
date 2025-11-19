import {
  ClueInfoTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { CluePageBuilderProps } from "./clue.types";
import { formatAnswers, getDirections, formatChallenges } from "./clue.utils";
import { InfoboxItem } from "../../templates";

import { vowel } from "@/utils/string";

const cluePageBuilder = ({
  answers,
  clue,
  challenges,
  emotes,
  id,
  item,
  itemName,
  requirements,
  tier,
  type,
  wieldedItems,
}: CluePageBuilderProps) => {
  const builder = new MediaWikiBuilder();
  builder.addContents([
    InfoboxItem({
      ...item,
      name: itemName,
    }).build(),
    new MediaWikiFile(`${itemName} detail.png`, {
      horizontalAlignment: "left",
      resizing: { width: 100 },
    }),
    new MediaWikiBreak(),
    new MediaWikiText(itemName, { bold: true }),
    new MediaWikiText(
      ` is ${vowel(
        type
      )} [[${type} clue]] obtained from [[${itemName}|${tier}]] [[Treasure Trails]].`
    ),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiHeader("Clue info", 2),
    new MediaWikiBreak(),
    new ClueInfoTemplate(
      id,
      getDirections(type, answers?.[0].type, clue),
      wieldedItems ? wieldedItems.map((items) => items.answer).join(", ") : "",
      formatAnswers(answers, emotes) +
        (requirements?.length > 0
          ? `\nRequires: ${requirements.join(", ")}`
          : "") +
        formatChallenges(challenges),
      _.flatten(
        answers.map((answer) => answer.worldLocs),
        1
      ).reduce<string>(
        (total, worldLoc) =>
          total +
          `${total.length > 0 ? "\n" : ""}{{Map|${worldLoc[0]},${
            worldLoc[1]
          }|mtype=pin|plane=${worldLoc[2]}|mapID=-1}}`,
        ""
      )
    ).build(),
  ]);
  return builder;
};

export default cluePageBuilder;
