import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { HastranscriptParams } from "./Hastranscript.types";
import { Template } from "../templates.types";

/**
 * Creates a {{Hastranscript}} template, used to indicate and link to or
 * transclude a transcript page for an NPC, quest, item, or other article.
 * See: https://oldschool.runescape.wiki/w/Template:Hastranscript
 */
export class HastranscriptTemplate extends Template {
  constructor(public params: HastranscriptParams = {}) {
    super("Hastranscript");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    const params = this.params;

    if (params.transclude) {
      const { pages } = params;
      if (pages !== undefined) {
        const pageList = Array.isArray(pages) ? pages : [pages];
        pageList.forEach((page) => template.add("", page));
      }
      template.add("transclude", "yes");
    } else {
      const { type, link } = params;
      if (type !== undefined) {
        template.add("", type);
      }
      if (link !== undefined) {
        template.add("", link);
      }
    }

    return template;
  }
}
