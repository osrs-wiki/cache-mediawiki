import {
  ITEM_PARAM_ID,
  getAnswer,
  getChallenge,
  getRequirements,
  getTblRegions,
  getTier,
  getWieldedItems,
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

const generateEmotePages = async (
  cache: Promise<FlatCacheProvider | DiskCacheProvider>
) => {
  const rows = await DBTable.loadRows(cache, 9);

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
        answers: await getAnswer(cache, values[3], "emote"),
        emotes: values[4].map((val) => val as number),
        requirements: await getRequirements(cache, values[10]),
        challenges: await getChallenge(cache, values[9]),
        tblRegions: getTblRegions(values[11]),
        wieldedItems: await getWieldedItems(cache, values[6]),
        itemName,
        item,
        type: "emote",
      });
      const truncatedClue = clue.split(".")?.[0];

      writeClueFile("emotes", itemName, truncatedClue, builder);
    }
  });

  console.log(`Generated ${rows.length} emote clue pages.`);
};

export default generateEmotePages;
