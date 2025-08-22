import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { SwitchInfoboxItem } from "./SwitchInfobox.types";
import { Template } from "../templates.types";

export class SwitchInfobox extends Template {
  items: SwitchInfoboxItem[];

  constructor(items: SwitchInfoboxItem[]) {
    super("Switch infobox");
    this.items = items;
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);

    this.items.forEach((item, index) => {
      const num = index + 1;
      template.add(`text${num}`, item.text);
      template.add(`item${num}`, item.item);
    });

    return template;
  }
}
