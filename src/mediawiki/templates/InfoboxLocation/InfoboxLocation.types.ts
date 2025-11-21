import {
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";

export type InfoboxLocation = {
  name: string;
  image: MediaWikiFile | string;
  release?: MediaWikiDate | string;
  update?: string;
  removal?: MediaWikiDate;
  removalupdate?: string;
  members?: boolean | string;
  location?: MediaWikiLink | string;
  wilderness?: boolean | string;
  teleport?: string;
  music?: string;
  map?: MediaWikiTemplate | string;
  type?: string;
};
