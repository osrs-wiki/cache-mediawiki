import Context from "../../../../context";
import { GameVal, NPC, NPCID, Reader } from "../../../../utils/cache2";
import {
  buildMonsterInfobox,
  buildNpcInfobox,
} from "../../../infoboxGenernator/infoboxes/npc/npc";
import { renderNpcs } from "../../../renders/npcs";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareNpcs: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? NPC.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <NPCID>oldFile.file.id
      )
    : undefined;
  oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, oldEntry);

  const newEntry = newFile
    ? NPC.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <NPCID>newFile.file.id
      )
    : undefined;
  newEntry.gameVal = await GameVal.nameFor(Context.newCacheProvider, newEntry);

  if (
    Context.infoboxes &&
    !oldEntry &&
    newEntry.name.toLocaleLowerCase() !== "null"
  ) {
    if (newEntry.combatLevel > 0) {
      buildMonsterInfobox(newEntry);
    } else {
      buildNpcInfobox(newEntry);
    }
  }

  if (Context.renders && newEntry) {
    renderNpcs(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareNpcs;
