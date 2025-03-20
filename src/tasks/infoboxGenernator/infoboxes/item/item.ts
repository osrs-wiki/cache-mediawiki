import {
  InfoboxTemplate,
  MediaWikiBreak,
  MediaWikiBuilder,
  MediaWikiDate,
  MediaWikiFile,
  MediaWikiHeader,
  MediaWikiTemplate,
} from "@osrs-wiki/mediawiki-builder";
import type { InfoboxItem } from "@osrs-wiki/mediawiki-builder";
import { mkdir, writeFile } from "fs/promises";

import {
  ATTACK_RANGE_PARAM,
  ATTACK_SPEED_PARAM,
  CRUSH_ATTACK_PARAM,
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DAMAGE_PARAM,
  MAGIC_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  PRAYER_BONUS_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  RANGED_STRENGTH_PARAM,
  SLASH_ATTACK_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
  formatBonus,
  getEquipmentSlot,
  getInventoryActions,
  getWeaponCategory,
} from "./item.utils";
import Context from "../../../../context";
import { CacheProvider, Item, WearPos } from "../../../../utils/cache2";

const itemInfoboxGenerator = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const item = await Item.load(cache, id);

    buildItemInfobox(item);
  } catch (e) {
    console.error(`Error generating infobox for item ${id}: `, e);
  }
};

export const buildItemInfobox = async (item: Item, writeFiles = true) => {
  try {
    const infoboxItem = new InfoboxTemplate<InfoboxItem>("item", {
      name: item.name as string,
      image: new MediaWikiFile(`${item.name}.png`),
      release: Context.updateDate
        ? new MediaWikiDate(new Date(Context.updateDate))
        : undefined,
      update: Context.update,
      members: item.isMembers as boolean,
      quest: "No",
      exchange: item.isGrandExchangable,
      tradeable: item.isGrandExchangable,
      bankable: item.placeholderLinkedItem > 0,
      placeholder: item.placeholderLinkedItem > 1 ? true : undefined,
      equipable: item.wearpos1 > 0,
      stackable: item.isStackable,
      noteable: item.noteLinkedItem > 0,
      options: getInventoryActions(item),
      examine: item.examine,
      value: item.price,
      weight: (item.weight / 1000).toFixed(3),
      id: item.id.toString(),
    });

    let infoboxBonuses = undefined;
    let combatStyles = undefined;
    if (item.wearpos1 > 0) {
      infoboxBonuses = new InfoboxTemplate("bonuses", {
        astab: item.params.has(STAB_ATTACK_PARAM)
          ? formatBonus(item.params.get(STAB_ATTACK_PARAM))
          : "0",
        aslash: item.params.has(SLASH_ATTACK_PARAM)
          ? formatBonus(item.params.get(SLASH_ATTACK_PARAM))
          : "0",
        acrush: item.params.has(CRUSH_ATTACK_PARAM)
          ? formatBonus(item.params.get(CRUSH_ATTACK_PARAM))
          : "0",
        amagic: item.params.has(MAGIC_ATTACK_PARAM)
          ? formatBonus(item.params.get(MAGIC_ATTACK_PARAM))
          : "0",
        arange: item.params.has(RANGED_ATTACK_PARAM)
          ? formatBonus(item.params.get(RANGED_ATTACK_PARAM))
          : "0",
        dstab: item.params.has(STAB_DEFENCE_PARAM)
          ? formatBonus(item.params.get(STAB_DEFENCE_PARAM))
          : "0",
        dslash: item.params.has(SLASH_DEFENCE_PARAM)
          ? formatBonus(item.params.get(SLASH_DEFENCE_PARAM))
          : "0",
        dcrush: item.params.has(CRUSH_DEFENCE_PARAM)
          ? formatBonus(item.params.get(CRUSH_DEFENCE_PARAM))
          : "0",
        dmagic: item.params.has(MAGIC_DEFENCE_PARAM)
          ? formatBonus(item.params.get(MAGIC_DEFENCE_PARAM))
          : "0",
        drange: item.params.has(RANGED_DEFENCE_PARAM)
          ? formatBonus(item.params.get(RANGED_DEFENCE_PARAM))
          : "0",
        str: item.params.has(MELEE_STRENGTH_PARAM)
          ? formatBonus(item.params.get(MELEE_STRENGTH_PARAM))
          : "0",
        rstr: item.params.has(RANGED_STRENGTH_PARAM)
          ? formatBonus(item.params.get(RANGED_STRENGTH_PARAM))
          : "0",
        mdmg: item.params.has(MAGIC_DAMAGE_PARAM)
          ? `${parseInt(item.params.get(MAGIC_DAMAGE_PARAM).toString()) / 10}`
          : "0",
        prayer: item.params.has(PRAYER_BONUS_PARAM)
          ? formatBonus(item.params.get(PRAYER_BONUS_PARAM))
          : "0",
        slot: getEquipmentSlot(item),
        speed:
          item.wearpos1 === WearPos.Weapon &&
          item.params.has(ATTACK_SPEED_PARAM)
            ? item.params.get(ATTACK_SPEED_PARAM) ?? "0"
            : undefined,
        attackrange:
          item.wearpos1 === WearPos.Weapon &&
          item.params.has(ATTACK_RANGE_PARAM)
            ? item.params.get(ATTACK_RANGE_PARAM) ?? "0"
            : undefined,
        combatstyle: getWeaponCategory(item),
        image: new MediaWikiFile(`${item.name} equipped male.png`),
        altimage: new MediaWikiFile(`${item.name} equipped female.png`),
      });

      if (item.wearpos1 === WearPos.Weapon && item.category > -1) {
        combatStyles = new MediaWikiTemplate("CombatStyles");
        combatStyles.add(
          "speed",
          item.params.get(ATTACK_SPEED_PARAM)?.toString() ?? "0"
        );
        combatStyles.add(
          "attackrange",
          item.params.get(ATTACK_RANGE_PARAM)?.toString() ?? "0"
        );
        combatStyles.add("combatstyle", getWeaponCategory(item));
      }
    }

    const builder = new MediaWikiBuilder();
    builder.addContents([
      new MediaWikiTemplate("New Content"),
      infoboxItem.build(),
      new MediaWikiFile(`${item.name} detail.png`, {
        horizontalAlignment: "left",
        resizing: { width: 130 },
      }),
      new MediaWikiBreak(),
    ]);

    if (infoboxBonuses) {
      builder.addContents([
        new MediaWikiBreak(),
        new MediaWikiHeader("Combat stats", 2),
        new MediaWikiBreak(),
        infoboxBonuses.build(),
        new MediaWikiBreak(),
      ]);

      if (combatStyles) {
        builder.addContents([combatStyles, new MediaWikiBreak()]);
      }
    }

    if (writeFiles) {
      await mkdir("./out/infobox/item", { recursive: true });
      writeFile(`./out/infobox/item/${item.id}.txt`, builder.build());
    }
    return builder;
  } catch (e) {
    console.error("Error building item infobox: ", e);
  }
};

export default itemInfoboxGenerator;
