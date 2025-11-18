import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import { getWeaponCategory } from "@/types/item";
import { ATTACK_RANGE_PARAM, ATTACK_SPEED_PARAM } from "@/types/params";
import { Item } from "@/utils/cache2";

export const CombatStyles = (item: Item) => {
  const combatStyles = new MediaWikiTemplate("CombatStyles");
  combatStyles.add("", getWeaponCategory(item));
  combatStyles.add(
    "speed",
    item.params.get(ATTACK_SPEED_PARAM)?.toString() ?? "0"
  );
  combatStyles.add(
    "attackrange",
    item.params.get(ATTACK_RANGE_PARAM)?.toString() ?? "0"
  );
  return combatStyles;
};

export default CombatStyles;
