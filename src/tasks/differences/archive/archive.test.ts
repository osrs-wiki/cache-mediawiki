import differencesArchive from "./archive";

import Context from "@/context";
import { ArchiveData, GameVal, GameValType, IndexType } from "@/utils/cache2";
import { ConfigType } from "@/utils/cache2/types";

const preparedArchive = (
  index: number,
  archiveId: number,
  files: Map<number, Uint8Array>
) => {
  const archive = new ArchiveData(index, archiveId);
  archive.decryptedData = new Uint8Array();
  files.forEach((data, id) => {
    archive.addFile(id, 0);
    const file = archive.files.get(id);
    if (!file) {
      throw new Error(`Archive file ${id} was not created.`);
    }
    file.data = data;
  });
  return archive;
};

describe("differencesArchive", () => {
  it("compares DBTables that exist only in GameVal metadata", async () => {
    const oldConfig = preparedArchive(
      IndexType.Configs,
      ConfigType.DbTable,
      new Map()
    );
    const newConfig = preparedArchive(
      IndexType.Configs,
      ConfigType.DbTable,
      new Map()
    );
    const oldGameVals = preparedArchive(
      IndexType.GameVals,
      GameValType.DBTables,
      new Map([[5, new Uint8Array([1])]])
    );
    const newGameVals = preparedArchive(
      IndexType.GameVals,
      GameValType.DBTables,
      new Map([[5, new Uint8Array([2])]])
    );
    const previousOldCache = Context.oldCacheProvider;
    const previousNewCache = Context.newCacheProvider;
    const oldCache = {
      getArchive: jest.fn(async (index: number, archive: number) =>
        index === IndexType.GameVals && archive === GameValType.DBTables
          ? oldGameVals
          : undefined
      ),
    };
    const newCache = {
      getArchive: jest.fn(async (index: number, archive: number) =>
        index === IndexType.GameVals && archive === GameValType.DBTables
          ? newGameVals
          : undefined
      ),
    };
    Context.oldCacheProvider =
      oldCache as unknown as typeof Context.oldCacheProvider;
    Context.newCacheProvider =
      newCache as unknown as typeof Context.newCacheProvider;
    const gameValLoad = jest.spyOn(GameVal, "load") as unknown as jest.Mock;
    gameValLoad.mockImplementation(async (cache: unknown) =>
      cache === oldCache
        ? ({
            name: "old_table",
            files: new Map([[0, "old_column"]]),
          } as GameVal)
        : ({
            name: "new_table",
            files: new Map([[0, "new_column"]]),
          } as GameVal)
    );

    try {
      const result = await differencesArchive({
        oldIndex: { id: IndexType.Configs, revision: 1 } as never,
        newIndex: { id: IndexType.Configs, revision: 2 } as never,
        oldArchive: oldConfig,
        newArchive: newConfig,
        forcedGameValArchive: GameValType.DBTables,
      });

      expect(result[5]?.changed?.gameVal).toEqual({
        oldValue: "old_table",
        newValue: "new_table",
      });
      expect(result[5]?.changed?.columnNames).toEqual({
        oldValue: { 0: "old_column" },
        newValue: { 0: "new_column" },
      });
    } finally {
      gameValLoad.mockRestore();
      Context.oldCacheProvider = previousOldCache;
      Context.newCacheProvider = previousNewCache;
    }
  });
});
