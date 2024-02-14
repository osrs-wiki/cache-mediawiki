import _ from "underscore";

import { NPC, NPCID, Reader } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file";

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

  return getFileDifferences(oldEntry, newEntry);
};

export default compareNpcs;
