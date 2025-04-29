import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

import Context from "@/context";
import { GameVal, Reader, SpotAnim, SpotAnimID } from "@/utils/cache2";

const compareSpotAnim: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? SpotAnim.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <SpotAnimID>oldFile.file.id
      )
    : undefined;
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(
      Context.oldCacheProvider,
      oldEntry
    );
  }

  const newEntry = newFile
    ? SpotAnim.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <SpotAnimID>newFile.file.id
      )
    : undefined;
  if (newEntry) {
    newEntry.gameVal = await GameVal.nameFor(
      Context.newCacheProvider,
      newEntry
    );
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareSpotAnim;
