import { Item } from "../../../utils/cache2";

export type ClueAnswer = {
  answer: string | number | bigint;
  entityName: string;
  type: string;
  worldLocs: number[][];
};

export type ClueChallenge = {
  answer: string;
  task: string;
};

export type ClueWieldedItems = {
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
  answers?: ClueAnswer[];
  challenge?: ClueChallenge;
  clue: string;
  emotes?: number[];
  id: string;
  item?: Item;
  itemName: string;
  requirements?: string[];
  tblRegions?: string;
  tier: string;
  type: string;
  wieldedItems?: ClueWieldedItems[];
};
