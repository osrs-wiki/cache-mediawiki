import {
  ClueInfoTemplate,
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem } from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { CluePageBuilderProps } from "./clue.types";
import { formatAnswers, getDirections } from "./clue.utils";

import Context from "@/context";
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
    new InfoboxTemplate<InfoboxItem>("Item", {
      name: itemName,
      image: new MediaWikiFile(`${itemName}.png`),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : "",
      update: Context.update ?? "",
      members: true,
      quest: "No",
      tradeable: false,
      equipable: false,
      stackable: false,
      options: item?.inventoryActions,
      examine: item?.examine,
      value: item?.price,
      weight: `${item?.weight ? (item.weight / 1000).toFixed(3) : ""}`,
      id: `${item?.id}`,
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
        (challenges && challenges.length > 0
          ? challenges.length === 1
            ? `\nThe clue has an additional challenge:${
                challenges[0].task ? "\n\n" + challenges[0].task : ""
              }${challenges[0].answer ? "\n\n" : ""}${challenges[0].answer}`
            : `\nThe clue will have one of the following challenges:${challenges.map(
                (challenge) => 
                  `\n- ${challenge.task ? challenge.task + (challenge.answer ? "\n  " + challenge.answer : "") : challenge.answer || ""}`
              ).join("")}`
          : ""),
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
