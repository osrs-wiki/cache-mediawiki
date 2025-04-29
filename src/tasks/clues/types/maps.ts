import {
  ITEM_PARAM_ID,
  getAnswer,
  getRequirements,
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

const generateMapPages = async (
  cache: Promise<FlatCacheProvider | DiskCacheProvider>
) => {
  const rows = await DBTable.loadRows(cache, 5);

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

        const answers = await getAnswer(cache, values[2]);

        const itemName = `Clue scroll (${tier})`;
        const item = paramMap[dbRowId as number];
        const builder = cluePageBuilder({
          id,
          tier,
          clue: answers.map((answer) => answer.answer).join(", "),
          answers: answers,
          requirements: await getRequirements(cache, values[3]),
          tblRegions: getTblRegions(values[4]),
          itemName,
          item,
          type: "map",
        });

        writeClueFile("maps", itemName, answers[0].answer as string, builder);
      }
    } catch (e) {
      console.error(`Error creating clue ${row.id}: ${e}`);
    }
  });

  console.log(`Generated ${rows.length} map clue pages.`);
};

export default generateMapPages;
