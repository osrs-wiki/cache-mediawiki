import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { QuestreqstartParams } from "./Questreqstart.types";
import { Template } from "../templates.types";

export class QuestreqstartTemplate extends Template {
  constructor(public params: QuestreqstartParams) {
    super("Questreqstart");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    template.add("", this.params.required ? "yes" : "no");
    return template;
  }
}
