import { ClueAnswer, ClueChallenge, ClueWieldedItems } from "@/types/clue";
import { Item } from "@/utils/cache2";

export type CluePageBuilderProps = {
  answers?: ClueAnswer[];
  challenges?: ClueChallenge[];
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
