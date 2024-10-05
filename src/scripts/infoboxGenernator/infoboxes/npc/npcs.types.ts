import { MediaWikiDate, MediaWikiFile } from "@osrs-wiki/mediawiki-builder";

export type InfoboxMonster = {
  name: string;
  image: MediaWikiFile;
  release: MediaWikiDate | "";
  update: string;
  removal?: MediaWikiDate;
  removalupdate?: MediaWikiDate;
  members?: boolean;
  combat?: number;
  size?: number;
  examine?: string;
  attributes?: string;
  xpbonus?: number;
  max_hit?: number;
  aggressive?: boolean;
  attack_style?: string;
  attack_speed?: number;
  slaylvl?: number;
  slayxp?: number;
  cat?: string;
  assignedBy?: string;
  hitpoints?: number;
  att?: number;
  str?: number;
  def?: number;
  mage?: number;
  range?: number;
  attbns?: number;
  strbns?: number;
  amagic?: number;
  mbns?: number;
  arange?: number;
  rngbns?: number;
  dstab?: number;
  dslash?: number;
  dcrush?: number;
  dmagic?: number;
  dlight?: number;
  dstandard?: number;
  dheavy?: number;
  immunepoison?: boolean;
  immunevenom?: boolean;
  immunecannon?: boolean;
  immunethrall?: boolean;
  freezeresistance?: boolean;
  id?: string;
};
