import {
  generateEquippedImageParams,
  createInfoboxBonusesData,
  InfoboxBonusesData,
} from "./InfoboxBonuses.utils";
import { InfoboxTemplate } from "../InfoboxTemplate";

import { Item } from "@/utils/cache2";

const InfoboxBonuses = (items: Item | Item[]) => {
  // Normalize to array
  const itemArray = Array.isArray(items) ? items : [items];

  if (itemArray.length === 1) {
    // Single item - existing behavior
    const bonusData = createInfoboxBonusesData(itemArray[0]);
    const imageParams = generateEquippedImageParams(items);
    return new InfoboxTemplate<InfoboxBonusesData>("bonuses", {
      ...bonusData,
      ...imageParams,
    });
  } else {
    // Multiple items - create array of bonus data
    const bonusDataArray: InfoboxBonusesData[] = itemArray.map((item) =>
      createInfoboxBonusesData(item)
    );
    // Generate image params (will be merged by InfoboxTemplate)
    const imageParams = generateEquippedImageParams(items);
    // Add image params to all items in the array (InfoboxTemplate will handle deduplication)
    const mergedData: InfoboxBonusesData[] = bonusDataArray.map((data) => ({
      ...data,
      ...imageParams,
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new InfoboxTemplate<any>("bonuses", mergedData);
  }
};

export default InfoboxBonuses;
