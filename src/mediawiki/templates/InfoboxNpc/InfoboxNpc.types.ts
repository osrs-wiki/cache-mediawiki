import { MediaWikiFile, MediaWikiDate } from "@osrs-wiki/mediawiki-builder";

export type InfoboxNpc = {
  name: string;
  image: MediaWikiFile;
  release: MediaWikiDate | undefined;
  update: string;
  removal?: MediaWikiDate;
  removalupdate?: MediaWikiDate;
  members?: boolean;
  level?: string;
  race?: string;
  location?: string;
  gender?: string;
  options?: string[];
  map?: string;
  examine?: string;
  id: string;
};
