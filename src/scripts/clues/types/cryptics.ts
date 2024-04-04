import {
  DBTable,
  DiskCacheProvider,
  FlatCacheProvider,
  Item,
} from "@abextm/cache2";
import type { ParamID } from "@abextm/cache2";

import cluePageBuilder from "../builder";
import {
  ITEM_PARAM_ID,
  getAnswer,
  getChallenge,
  getRequirements,
  getTblRegions,
  getTier,
  getWieldedItems,
  writeClueFile,
} from "../utils";

const generateCrypticPages = async (
  cache: Promise<FlatCacheProvider | DiskCacheProvider>
) => {
  const rows = await DBTable.loadRows(cache, 8);

  const items = await Item.all(cache);
  const paramMap: { [key: string | number]: Item } = {};
  items.forEach((item) => {
    if (
      item.name.includes("Clue scroll") &&
      item.params.has(ITEM_PARAM_ID as ParamID)
    ) {
      paramMap[item.params.get(ITEM_PARAM_ID as ParamID) as number] = item;
    }
  });

  rows.forEach(async (row) => {
    try {
      if (row) {
        const dbRowId = row.id;
        const values = row.values;
        const id = values[0][0] as string;
        const tier = getTier(values[1][0]);
        const clue = values[2][0] as string;

        const itemName = `Clue scroll (${tier})`;
        const item = paramMap[dbRowId as number];
        const builder = cluePageBuilder({
          id,
          tier,
          clue,
          answers: await getAnswer(cache, values[3]),
          requirements: await getRequirements(cache, values[4]),
          challenge: await getChallenge(cache, values[5]?.[0]),
          tblRegions: getTblRegions(values[10]),
          itemName,
          item,
          type: "cryptic",
          wieldedItems: await getWieldedItems(cache, values[7]),
        });

        writeClueFile("cryptics", itemName, clue, builder);
      }
    } catch (e) {
      console.error(`Error creating clue ${row.id}: ${e}`);
    }
  });
};

export default generateCrypticPages;
