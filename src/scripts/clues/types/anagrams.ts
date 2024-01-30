import { mkdir, writeFile } from "fs/promises";

import {
  DBTable,
  FlatCacheProvider,
  Item,
  ParamID,
} from "../../../utils/cache2";
import cluePageBuilder from "../builder";
import {
  ITEM_PARAM_ID,
  getAnswer,
  getChallenge,
  getRequirements,
  getTblRegions,
  getTier,
} from "../utils";

const generateAnagramPages = async (cache: Promise<FlatCacheProvider>) => {
  const rows = await DBTable.loadRows(cache, 4);

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
        requirements: await getRequirements(cache, values[6]),
        answers: await getAnswer(cache, values[3]),
        challenge: await getChallenge(cache, values[4]?.[0]),
        tblRegions: getTblRegions(values[5]),
        itemName,
        item,
        type: "anagram",
      });

      const dir = `./out/clues/anagrams`;
      await mkdir(dir, { recursive: true });
      await writeFile(`${dir}/${itemName} - ${clue}.txt`, builder.build());
    }
  });
};

export default generateAnagramPages;
