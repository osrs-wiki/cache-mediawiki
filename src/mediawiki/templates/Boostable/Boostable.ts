import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { BoostableParams } from "./Boostable.types";
import { Template } from "../templates.types";

export class BoostableTemplate extends Template {
  constructor(public params: BoostableParams) {
    super("Boostable");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    template.add("", this.params.boostable ? "yes" : "no");
    return template;
  }
}
