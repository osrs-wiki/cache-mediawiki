import { MediaWikiFile, MediaWikiDate } from "@osrs-wiki/mediawiki-builder";

export type InfoboxMusic = {
  name: string;
  number?: string;
  file?: MediaWikiFile;
  release?: MediaWikiDate;
  update?: string;
  removal?: MediaWikiDate;
  removalupdate?: string;
  members?: boolean;
  location?: string;
  hint?: string;
  quest?: string;
  duration?: string;
  composer?: string;
  map?: string;
};