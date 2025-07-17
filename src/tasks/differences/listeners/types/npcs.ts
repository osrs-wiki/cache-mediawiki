import { writeNpcPage } from "../../../pages/types";
import { renderNpcs } from "../../../renders/npcs";
import { cacheListeners } from "../listeners";
import { CacheChangeListener } from "../listeners.types";

import Context from "@/context";
import {
  IndexType,
  ConfigType,
  GameVal,
  NPC,
  NPCID,
  Reader,
} from "@/utils/cache2";

const npcListener: CacheChangeListener = {
  index: IndexType.Configs,
  archive: ConfigType.Npc,
  handler: async ({ oldFile, newFile }) => {
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
      newEntry &&
      newEntry.name.toLocaleLowerCase() !== "null"
    ) {
      writeNpcPage(newEntry);
    }

    if (Context.renders && newEntry) {
      renderNpcs(newEntry);
    }
  },
};

cacheListeners.push(npcListener);
