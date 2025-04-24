import Context from "../../../../context";
import { GameVal, NPC, NPCID, Reader } from "../../../../utils/cache2";
import { writeNpcPage } from "../../../pages/types";
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
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(
      Context.oldCacheProvider,
      oldEntry
    );
  }

  const newEntry = newFile
    ? NPC.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <NPCID>newFile.file.id
      )
    : undefined;
  if (newEntry) {
    newEntry.gameVal = await GameVal.nameFor(
      Context.newCacheProvider,
      newEntry
    );
  }

  if (
    Context.pages &&
    !oldEntry &&
    newEntry.name.toLocaleLowerCase() !== "null"
  ) {
    writeNpcPage(newEntry);
  }

  if (Context.renders && newEntry) {
    renderNpcs(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareNpcs;
