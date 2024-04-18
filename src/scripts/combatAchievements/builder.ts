import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import { CombatAchievement } from "./types";
import Context from "../../context";
import { lowerCaseFirst, vowel } from "../../utils/string";

const combatAchievementPageBuilder = (combatAchievement: CombatAchievement) => {
  const builder = new MediaWikiBuilder();

  const infobox = new MediaWikiTemplate("Infobox Combat Achievement");
  infobox.add("name", combatAchievement.title);
  infobox.add(
    "image",
    new MediaWikiFile(`${combatAchievement.monster}.png`, {
      resizing: { width: 150 },
    }).build()
  );
  if (Context.updateDate) {
    infobox.add(
      "release",
      new MediaWikiDate(new Date(Context.updateDate)).build()
    );
  }
  if (Context.update) {
    infobox.add("update", Context.update);
  }
  infobox.add("members", "Yes");
  infobox.add("description", combatAchievement.description);
  infobox.add("tier", combatAchievement.tier);
  infobox.add("monster", combatAchievement.monster);
  infobox.add("type", combatAchievement.type);
  infobox.add("id", `${combatAchievement.id}`);

  builder.addContents([
    infobox,
    new MediaWikiText(combatAchievement.title, { bold: true }),
    new MediaWikiText(` is ${vowel(combatAchievement.tier)} `),
    new MediaWikiLink(
      `Combat Achievements/${combatAchievement.tier}`,
      `${combatAchievement.tier.toLocaleLowerCase()} combat achievement`
    ),
    new MediaWikiText(
      ` which requires the player to ${lowerCaseFirst(
        combatAchievement.description
      )}`
    ),
    new MediaWikiBreak(),
    new MediaWikiBreak(),
    new MediaWikiTemplate("Combat Achievements"),
  ]);

  return builder;
};

export default combatAchievementPageBuilder;
