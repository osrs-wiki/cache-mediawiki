import {
  MediaWikiFile,
  MediaWikiDate,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";

export type InfoboxScenery = {
  name: string;
  image: MediaWikiFile;
  release: MediaWikiDate | undefined;
  update: string;
  removal?: MediaWikiDate;
  removalupdate?: MediaWikiDate;
  members?: boolean;
  quest?: string;
  location?: string;
  options?: string[];
  respawn?: number;
  icon?: MediaWikiFile;
  map?: MediaWikiTemplate | string;
  examine?: string;
  id: string;
};

export type InfoboxSceneryOptions = {
  location?: string;
  map?: MediaWikiTemplate | string;
};
