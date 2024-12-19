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
} from "./item.utils";
import Context from "../../../../context";
import { CacheProvider, Item, ParamID } from "../../../../utils/cache2";

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

export const buildItemInfobox = async (item: Item) => {
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
      options: item.inventoryActions,
      examine: item.examine,
      value: item.price,
      weight: (item.weight / 1000).toFixed(3),
      id: item.id.toString(),
    });

    let infoboxBonuses = undefined;
    if (item.wearpos1 > 0) {
      infoboxBonuses = new InfoboxTemplate("bonuses", {
        astab: formatBonus(item.params.get(STAB_ATTACK_PARAM as ParamID)),
        aslash: formatBonus(item.params.get(SLASH_ATTACK_PARAM as ParamID)),
        acrush: formatBonus(item.params.get(CRUSH_ATTACK_PARAM as ParamID)),
        amagic: formatBonus(item.params.get(MAGIC_ATTACK_PARAM as ParamID)),
        arange: formatBonus(item.params.get(RANGED_ATTACK_PARAM as ParamID)),
        dstab: formatBonus(item.params.get(STAB_DEFENCE_PARAM as ParamID)),
        dslash: formatBonus(item.params.get(SLASH_DEFENCE_PARAM as ParamID)),
        dcrush: formatBonus(item.params.get(CRUSH_DEFENCE_PARAM as ParamID)),
        dmagic: formatBonus(item.params.get(MAGIC_DEFENCE_PARAM as ParamID)),
        drange: formatBonus(item.params.get(RANGED_DEFENCE_PARAM as ParamID)),
        str: formatBonus(item.params.get(MELEE_STRENGTH_PARAM as ParamID)),
        rstr: formatBonus(item.params.get(RANGED_STRENGTH_PARAM as ParamID)),
        mdmg: `${
          parseInt(item.params.get(MAGIC_DAMAGE_PARAM as ParamID).toString()) /
          10
        }`,
        prayer: formatBonus(item.params.get(PRAYER_BONUS_PARAM as ParamID)),
        slot: getEquipmentSlot(item),
        speed: item.params.get(ATTACK_SPEED_PARAM as ParamID),
        attackrange: item.params.get(ATTACK_RANGE_PARAM as ParamID),
        image: new MediaWikiFile(`${item.name} equipped male.png`),
        altimage: new MediaWikiFile(`${item.name} equipped female.png`),
      });
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
        new MediaWikiHeader("Combat stats", 2),
        infoboxBonuses.build(),
        new MediaWikiBreak(),
      ]);
    }

    await mkdir("./out/infobox/item", { recursive: true });
    writeFile(`./out/infobox/item/${item.id}.txt`, builder.build());
  } catch (e) {
    console.error("Error building item infobox: ", e);
  }
};

export default itemInfoboxGenerator;
