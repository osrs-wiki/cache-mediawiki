import { MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type QuestRewardsParams = {
  name: string;
  image?: MediaWikiFile | string;
  qp: number;
  qpDetails?: string;
  rewards?: string;
};
