import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type InfoboxScenery = {
  name: string;
  image: MediaWikiFile;
  release: MediaWikiDate | "";
  update: string;
  removal?: MediaWikiDate;
  removalupdate?: MediaWikiDate;
  members?: boolean;
  quest?: string;
  options?: string[];
  respawn?: number;
  icon?: MediaWikiFile;
  map: string;
  examine: string;
  id: string;
};
