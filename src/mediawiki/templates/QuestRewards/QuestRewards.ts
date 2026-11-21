import {
  MediaWikiContent,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";

import { QuestRewardsParams } from "./QuestRewards.types";
import { Template } from "../templates.types";

export class QuestRewardsTemplate extends Template {
  constructor(public params: QuestRewardsParams) {
    super("Quest rewards");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    template.add("name", this.params.name);
    template.add(
      "image",
      this.params.image instanceof MediaWikiContent
        ? this.params.image.build().trimEnd()
        : this.params.image ?? ""
    );
    template.add("qp", this.params.qp.toString());
    if (this.params.qpDetails !== undefined) {
      template.add("qp details", this.params.qpDetails);
    }
    template.add("rewards", this.params.rewards ?? "");
    return template;
  }
}
