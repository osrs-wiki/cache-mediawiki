import {
  InfoboxTemplate,
  MediaWikiDate,
  MediaWikiFile,
} from "@osrs-wiki/mediawiki-builder";

import Context from "@/context";
import { InfoboxMonster } from "@/mediawiki/pages/npc/npc.types";
import {
  CRUSH_DEFENCE_PARAM,
  MAGIC_ATTACK_PARAM,
  MAGIC_DEFENCE_PARAM,
  MELEE_STRENGTH_PARAM,
  RANGED_ATTACK_PARAM,
  RANGED_DEFENCE_PARAM,
  RANGED_EQUIPMENT_STRENGTH_PARAM,
  SLASH_DEFENCE_PARAM,
  STAB_ATTACK_PARAM,
  STAB_DEFENCE_PARAM,
} from "@/types/params";
import { NPC } from "@/utils/cache2";

const InfoboxMonsterTemplate = (npc: NPC) => {
  const infoboxData: InfoboxMonster = {
    name: npc.name as string,
    image: new MediaWikiFile(`${npc.name}.png`, {
      resizing: { width: 120 },
    }),
    release: Context.updateDate
      ? new MediaWikiDate(new Date(Context.updateDate))
      : undefined,
    update: Context.update,
    members: true,
    combat: npc.combatLevel,
    size: npc.size,
    hitpoints: npc.hitpoints,
    att: npc.attack,
    def: npc.defence,
    mage: npc.magic,
    range: npc.ranged,
    examine: Context.examines?.npcs ? Context.examines.npcs[npc.id] : "",
    id: `${Context.beta ? "beta" : ""}${npc.id.toString()}`,
  };

  // Add stat bonuses from params if they exist
  if (npc.params.has(STAB_ATTACK_PARAM)) {
    infoboxData.attbns = parseInt(npc.params.get(STAB_ATTACK_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(MELEE_STRENGTH_PARAM)) {
    infoboxData.strbns = parseInt(npc.params.get(MELEE_STRENGTH_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(MAGIC_ATTACK_PARAM)) {
    infoboxData.amagic = parseInt(npc.params.get(MAGIC_ATTACK_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(MAGIC_DEFENCE_PARAM)) {
    infoboxData.mbns = parseInt(npc.params.get(MAGIC_DEFENCE_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(RANGED_ATTACK_PARAM)) {
    infoboxData.arange = parseInt(npc.params.get(RANGED_ATTACK_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(RANGED_EQUIPMENT_STRENGTH_PARAM)) {
    infoboxData.rngbns = parseInt(npc.params.get(RANGED_EQUIPMENT_STRENGTH_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(STAB_DEFENCE_PARAM)) {
    infoboxData.dstab = parseInt(npc.params.get(STAB_DEFENCE_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(SLASH_DEFENCE_PARAM)) {
    infoboxData.dslash = parseInt(npc.params.get(SLASH_DEFENCE_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(CRUSH_DEFENCE_PARAM)) {
    infoboxData.dcrush = parseInt(npc.params.get(CRUSH_DEFENCE_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(MAGIC_DEFENCE_PARAM)) {
    infoboxData.dmagic = parseInt(npc.params.get(MAGIC_DEFENCE_PARAM)?.toString() || "0");
  }
  
  if (npc.params.has(RANGED_DEFENCE_PARAM)) {
    // Note: The InfoboxMonster type uses different field names for ranged defense
    // Based on the wiki template, this might map to dlight, dstandard, or dheavy
    // For now, using a generic approach - this may need adjustment based on actual usage
    infoboxData.dlight = parseInt(npc.params.get(RANGED_DEFENCE_PARAM)?.toString() || "0");
  }

  return new InfoboxTemplate<InfoboxMonster>("Monster", infoboxData);
};

export default InfoboxMonsterTemplate;