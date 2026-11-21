import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type InfoboxQuest = {
  name: string;
  number: string | number;
  image: MediaWikiFile | string;
  release?: MediaWikiDate;
  update?: string;
  aka?: string;
  members: boolean;
  series: string;
  developer: string;
};
