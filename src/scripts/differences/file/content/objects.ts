import Context from "../../../../context";
import { GameVal, Obj, ObjID, Reader } from "../../../../utils/cache2";
import { buildsceneryInfobox } from "../../../infoboxGenernator/infoboxes/scenery";
import { renderScenery } from "../../../renders/scenery";
import { CompareFn } from "../../differences.types";
import { getFileDifferences } from "../file.utils";

const compareObjects: CompareFn = async ({ oldFile, newFile }) => {
  const oldEntry = oldFile
    ? Obj.decode(
        new Reader(oldFile.file.data, {
          era: "osrs",
          indexRevision: oldFile.index.revision,
        }),
        <ObjID>oldFile.file.id
      )
    : undefined;
  oldEntry.gameVal = await GameVal.nameFor(Context.oldCacheProvider, oldEntry);

  const newEntry = newFile
    ? Obj.decode(
        new Reader(newFile.file.data, {
          era: "osrs",
          indexRevision: newFile.index.revision,
        }),
        <ObjID>newFile.file.id
      )
    : undefined;
  newEntry.gameVal = await GameVal.nameFor(Context.newCacheProvider, newEntry);

  if (
    Context.infoboxes &&
    !oldEntry &&
    newEntry.name.toLocaleLowerCase() !== "null"
  ) {
    buildsceneryInfobox(newEntry);
  }

  if (Context.renders && newEntry) {
    renderScenery(newEntry);
  }

  return getFileDifferences(oldEntry, newEntry);
};

export default compareObjects;
