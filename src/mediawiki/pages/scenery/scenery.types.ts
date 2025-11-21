import {
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";

export type InfoboxScenery = {
  name: string;
  image: MediaWikiFile;
  release: MediaWikiDate | "";
  update: string;
  removal?: MediaWikiDate;
  removalupdate?: MediaWikiDate;
  members?: boolean;
  quest?: string;
  location?: MediaWikiLink;
  options?: string[];
  respawn?: number;
  icon?: MediaWikiFile;
  map?: MediaWikiTemplate | string;
  examine: string;
  id: string;
};
