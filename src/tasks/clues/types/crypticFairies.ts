import {
  ITEM_PARAM_ID,
  getAnswer,
  getTblRegions,
  getTier,
  writeClueFile,
} from "../clues.utils";

import { cluePageBuilder } from "@/mediawiki/pages/clue";
import {
  DBTable,
  DiskCacheProvider,
  FlatCacheProvider,
  Item,
  ParamID,
} from "@/utils/cache2";

const generateFairyCrypticPages = async (
  cache: Promise<FlatCacheProvider | DiskCacheProvider>
) => {
  const rows = await DBTable.loadRows(cache, 10);

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
        answers: await getAnswer(cache, values[5]),
        tblRegions: getTblRegions(values[7]),
        itemName,
        item,
        type: "cryptic",
      });

      writeClueFile("crypticFairies", itemName, clue, builder);
    }
  });

  console.log(`Generated ${rows.length} fairy cryptic clue pages.`);
};

export default generateFairyCrypticPages;
