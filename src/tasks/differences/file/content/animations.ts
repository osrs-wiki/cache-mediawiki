import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

import Context from "@/context";
import { Animation, AnimationID, GameVal } from "@/utils/cache2";

const compareAnimations: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? new Animation(<AnimationID>oldFile.file.id)
    : undefined;
  if (oldEntry) {
    oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, {
      id: oldFile.file.id,
    });
  }

  const newEntry = newFile
    ? new Animation(<AnimationID>newFile.file.id)
    : undefined;
  if (newEntry) {
    newEntry.gameVal = await GameVal.nameFor(
      Context.newCacheProvider,
      newEntry
    );
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareAnimations;
