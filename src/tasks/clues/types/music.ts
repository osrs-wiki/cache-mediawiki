import { cluePageBuilder } from "../../../mediawiki/pages/clue";
import {
  DBTable,
  DiskCacheProvider,
  FlatCacheProvider,
  Item,
  ParamID,
} from "../../../utils/cache2";
import { ITEM_PARAM_ID, getAnswer, getTier, writeClueFile } from "../utils";

const generateMusicPages = async (
  cache: Promise<FlatCacheProvider | DiskCacheProvider>
) => {
  const rows = await DBTable.loadRows(cache, 13);

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

        const answers = await getAnswer(cache, values[4]);
        const musicAnswer = await getAnswer(cache, values[2]);
        const songName = musicAnswer.map((answer) => answer.answer).join(", ");
        answers.push({
          answer: ` Play the [[music]] track [[${songName}]].`,
          entityName: "",
          type: "music",
          worldLocs: [],
        });

        const itemName = `Clue scroll (${tier})`;
        const item = paramMap[dbRowId as number];
        const builder = cluePageBuilder({
          id,
          tier,
          clue: `I'd like to hear some music.\nCome and see me on the bridge in\nFalador Park, and play:\n${songName}\nThanks,\nCecilia`,
          answers: answers,
          itemName,
          item,
          type: "music",
        });

        writeClueFile("music", itemName, songName, builder);
      }
    } catch (e) {
      console.error(`Error creating clue ${row.id}: ${e}`);
    }
  });

  console.log(`Generated ${rows.length} music clue pages.`);
};

export default generateMusicPages;
