import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { SyncedSwitchVersion } from "./SyncedSwitch.types";
import { Template } from "../templates.types";

export class SyncedSwitch extends Template {
  versions: SyncedSwitchVersion[];

  constructor(versions: SyncedSwitchVersion[]) {
    super("Synced switch");
    this.versions = versions;
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name, { collapsed: false });

    this.versions.forEach((version) => {
      template.add(`version${version.version}`, version.content);
    });

    return template;
  }
}
