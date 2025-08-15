import {
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiLink,
  MediaWikiTemplate,
  MediaWikiText,
} from "@osrs-wiki/mediawiki-builder";

import Context from "@/context";
import { CombatAchievement } from "@/types/combatAchievements";
import { lowerCaseFirst, vowel } from "@/utils/string";

/**
 * Generate a MediaWikiBuillder from a CombatAchievement object.
 * @param combatAchievement The CombatAchievement
 * @returns A MediaWikiBuilder with all the CA page content
 */
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

  const combatAchievementsList = new MediaWikiTemplate(
    "Combat Achievements list"
  );
  combatAchievementsList.add("", combatAchievement.monster);

  if (Context.newContentTemplate) {
    builder.addContent(new MediaWikiTemplate(Context.newContentTemplate));
  }

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
    new MediaWikiHeader("Other tasks", 2),
    new MediaWikiBreak(),
    combatAchievementsList,
    new MediaWikiBreak(),
    new MediaWikiTemplate("Combat Achievements"),
  ]);

  return builder;
};

export default combatAchievementPageBuilder;
