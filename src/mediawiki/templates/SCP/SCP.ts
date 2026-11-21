import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { SCPParams } from "./SCP.types";
import { Template } from "../templates.types";

export class SCPTemplate extends Template {
  constructor(public params: SCPParams) {
    super("SCP");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    template.add("", this.params.skill);

    if (this.params.level !== undefined) {
      template.add("", this.params.level.toLocaleString("en-US"));
    }
    if (this.params.link) {
      template.add("link", "yes");
    }
    if (this.params.sort !== undefined) {
      template.add("sort", this.params.sort);
    }

    return template;
  }
}
