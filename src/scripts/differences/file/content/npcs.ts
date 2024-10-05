import Context from "../../../../context";
import { NPC, NPCID, Reader } from "../../../../utils/cache2";
import {
  buildMonsterInfobox,
  buildNpcInfobox,
} from "../../../infoboxGenernator/infoboxes/npc/npc";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareNpcs: CompareFn = ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? NPC.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <NPCID>oldFile.file.id
      )
    : undefined;

  const newEntry = newFile
    ? NPC.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <NPCID>newFile.file.id
      )
    : undefined;

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

  return getFileDifferences(oldEntry, newEntry);
};

export default compareNpcs;
