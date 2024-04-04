import { NPC, Reader } from "@abextm/cache2";
import type { NPCID } from "@abextm/cache2";
import _ from "underscore";

import Context from "../../../../context";
import { buildNpcInfobox } from "../../../infoboxGenernator/infoboxes/npc";
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
    buildNpcInfobox(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareNpcs;
