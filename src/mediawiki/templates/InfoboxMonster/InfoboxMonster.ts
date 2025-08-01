import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import { InfoboxMonster } from "./InfoboxMonster.types";

import Context from "@/context";
import {
  ATTACK_SPEED_PARAM,
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DAMAGE_NPC_PARAM,
  MAGIC_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_EQUIPMENT_STRENGTH_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
} from "@/types/params";
import { NPC } from "@/utils/cache2";
import { stripHtmlTags } from "@/utils/string";

const InfoboxMonsterTemplate = (npc: NPC) => {
  const cleanName = stripHtmlTags(npc.name);
  const infoboxData: InfoboxMonster = {
    "name": cleanName,
    "image": new MediaWikiFile(`${cleanName}.png`, {
      resizing: { width: 120 },
    }),
    "release": Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    "update": Context.update,
    "members": true,
    "combat": npc.combatLevel,
    "size": npc.size,
    "examine": Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
    "attack speed": npc.params.has(ATTACK_SPEED_PARAM)
      ? parseInt(npc.params.get(ATTACK_SPEED_PARAM)?.toString() || "0")
      : undefined,
    "hitpoints": npc.hitpoints,
    "att": npc.attack,
    "def": npc.defence,
    "mage": npc.magic,
    "range": npc.ranged,
    "attbns": npc.params.has(STAB_ATTACK_PARAM)
      ? parseInt(npc.params.get(STAB_ATTACK_PARAM)?.toString() || "0")
      : undefined,
    "strbns": npc.params.has(MELEE_STRENGTH_PARAM)
      ? parseInt(npc.params.get(MELEE_STRENGTH_PARAM)?.toString() || "0")
      : undefined,
    "amagic": npc.params.has(MAGIC_ATTACK_PARAM)
      ? parseInt(npc.params.get(MAGIC_ATTACK_PARAM)?.toString() || "0")
      : undefined,
    "mbns": npc.params.has(MAGIC_DAMAGE_NPC_PARAM)
      ? parseInt(npc.params.get(MAGIC_DAMAGE_NPC_PARAM)?.toString() || "0")
      : undefined,
    "arange": npc.params.has(RANGED_ATTACK_PARAM)
      ? parseInt(npc.params.get(RANGED_ATTACK_PARAM)?.toString() || "0")
      : undefined,
    "rngbns": npc.params.has(RANGED_EQUIPMENT_STRENGTH_PARAM)
      ? parseInt(
          npc.params.get(RANGED_EQUIPMENT_STRENGTH_PARAM)?.toString() || "0"
        )
      : undefined,
    "dstab": npc.params.has(STAB_DEFENCE_PARAM)
      ? parseInt(npc.params.get(STAB_DEFENCE_PARAM)?.toString() || "0")
      : undefined,
    "dslash": npc.params.has(SLASH_DEFENCE_PARAM)
      ? parseInt(npc.params.get(SLASH_DEFENCE_PARAM)?.toString() || "0")
      : undefined,
    "dcrush": npc.params.has(CRUSH_DEFENCE_PARAM)
      ? parseInt(npc.params.get(CRUSH_DEFENCE_PARAM)?.toString() || "0")
      : undefined,
    "dmagic": npc.params.has(MAGIC_DEFENCE_PARAM)
      ? parseInt(npc.params.get(MAGIC_DEFENCE_PARAM)?.toString() || "0")
      : undefined,
    "id": `${Context.beta ? "beta" : ""}${npc.id.toString()}`,
  };

  return new InfoboxTemplate<InfoboxMonster>("Monster", infoboxData);
};

export default InfoboxMonsterTemplate;
