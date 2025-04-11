import Context from "../../../../context";
import { GameVal, Reader, SpriteID, Sprites } from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareSprites: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Sprites.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <SpriteID>oldFile.archive.archive
      )
    : undefined;
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(
      Context.oldCacheProvider,
      oldEntry
    );
  }

  const newEntry = newFile
    ? Sprites.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <SpriteID>newFile.archive.archive
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

export default compareSprites;
