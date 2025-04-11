import Context from "../../../../context";
import {
  GameVal,
  Reader,
  SpotAnim,
  SpotAnimID,
} from "../../../../utils/cache2";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

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
  oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, oldEntry);

  const newEntry = newFile
    ? SpotAnim.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <SpotAnimID>newFile.file.id
      )
    : undefined;
  newEntry.gameVal = await GameVal.nameFor(Context.newCacheProvider, newEntry);

  return getFileDifferences(oldEntry, newEntry);
};

export default compareSpotAnim;
