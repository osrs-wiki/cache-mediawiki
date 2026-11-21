import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { QuestDetailsParams } from "./QuestDetails.types";
import { Template } from "../templates.types";

export class QuestDetailsTemplate extends Template {
  constructor(public params: QuestDetailsParams) {
    super("Quest details");
  }

  build(): MediaWikiTemplate {
    const template = new MediaWikiTemplate(this.name);
    const {
      start,
      startmap,
      difficulty,
      description,
      length,
      requirements,
      items,
      recommended,
      kills,
      ironman,
      members,
      leagueRegion,
    } = this.params;

    template.add("start", start ?? "");
    template.add("startmap", startmap ?? "");
    template.add("difficulty", difficulty);
    template.add("description", description ?? "");
    template.add("length", length);
    template.add("requirements", requirements ?? "");
    template.add("items", items ?? "");
    template.add("recommended", recommended ?? "");
    template.add("kills", kills ?? "");
    if (ironman !== undefined) template.add("ironman", ironman);
    template.add("members", members ? "Yes" : "No");
    template.add("leagueRegion", leagueRegion ?? "");

    return template;
  }
}
