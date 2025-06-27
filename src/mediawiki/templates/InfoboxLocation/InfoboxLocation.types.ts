import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type InfoboxLocation = {
  name: string;
  image: MediaWikiFile | string;
  release?: MediaWikiDate | string;
  update?: string;
  removal?: MediaWikiDate;
  removalupdate?: string;
  members?: boolean | string;
  location?: string;
  wilderness?: boolean | string;
  teleport?: string;
  music?: string;
  map?: string;
  type?: string;
};
