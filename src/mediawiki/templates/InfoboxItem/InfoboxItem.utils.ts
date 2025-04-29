import { Item } from "../../../utils/cache2";

export const getInventoryActions = (item: Item) => {
  return item.inventoryActions?.map((action, index) => {
    const subops = item.subops?.[index];
    return subops?.length > 0 ? `${action} (${subops.join(", ")})` : action;
  });
};
