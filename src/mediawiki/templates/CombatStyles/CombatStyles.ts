import { MediaWikiTemplate } from "@osrs-wiki/mediawiki-builder";

import {
  ATTACK_SPEED_PARAM,
  ATTACK_RANGE_PARAM,
  getWeaponCategory,
} from "../../../types/item";
import { Item } from "../../../utils/cache2";

export const CombatStyles = (item: Item) => {
  const combatStyles = new MediaWikiTemplate("CombatStyles");
  combatStyles.add(
    "speed",
    item.params.get(ATTACK_SPEED_PARAM)?.toString() ?? "0"
  );
  combatStyles.add(
    "attackrange",
    item.params.get(ATTACK_RANGE_PARAM)?.toString() ?? "0"
  );
  combatStyles.add("combatstyle", getWeaponCategory(item));
  return combatStyles;
};

export default CombatStyles;
