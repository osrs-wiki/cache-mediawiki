import {
  ClueInfoTemplate,
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem } from "@osrs-wiki/mediawiki-builder";
import _ from "underscore";

import { ITEM_EXAMINES } from "./clues";
import { formatAnswers, getDirections, vowel } from "./utils";
import { Item } from "../../utils/cache2";

export type Answer = {
  answer: string | number | bigint;
  entityName: string;
  type: string;
  worldLocs: number[][];
};

export type Challenge = {
  answer: string;
  task: string;
};

export type WieldedItems = {
  answer: string;
  capeSlotCats?: number[];
  capeSlotIds?: number[];
  chestSlotCats?: number[];
  chestSlotIds?: number[];
  feetSlotCats?: number[];
  feetSlotIds?: number[];
  handSlotCats?: number[];
  handSlotIds?: number[];
  headSlotCats?: number[];
  headSlotIds?: number[];
  legSlotCats?: number[];
  legSlotIds?: number[];
  necklaceSlotCats?: number[];
  necklaceSlotIds?: number[];
  shieldSlotCats?: number[];
  shieldSlotIds?: number[];
  weaponSlotCats?: number[];
  weaponSlotIds?: number[];
};

export type CluePageBuilderProps = {
  answers?: Answer[];
  challenge?: Challenge;
  clue: string;
  emotes?: number[];
  id: string;
  item?: Item;
  itemName: string;
  requirements?: string[];
  tblRegions?: string;
  tier: string;
  type: string;
  wieldedItems?: WieldedItems[];
};

const cluePageBuilder = ({
  answers,
  clue,
  challenge,
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
      members: true,
      release: "",
      update: "",
      quest: "No",
      tradeable: false,
      equipable: false,
      stackable: false,
      options: item?.inventoryActions,
      examine: item ? ITEM_EXAMINES[item.id] : "",
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
        (challenge
          ? `\nThe clue has an additional challenge:${
              challenge.task ? "\n\n" + challenge.task : ""
            }${challenge.answer ? "\n\n" : ""}${challenge.answer}`
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
