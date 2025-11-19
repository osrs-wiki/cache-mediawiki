import Context from "../../../context";
import { renderItems } from "../../renders";
import { writePageToFile } from "../pages.utils";

import { itemPageBuilder } from "@/mediawiki/pages/item";
import { CacheProvider, Item } from "@/utils/cache2";
import { getBaseName } from "@/utils/string";

// Global map to track items by base name
const itemNameMap = new Map<string, Item[]>();
// Track which items we've already processed to avoid duplicates
const processedItems = new Set<string>();

export const writeItemPageFromCache = async (
  cache: Promise<CacheProvider>,
  id: number
) => {
  try {
    const item = await Item.load(cache, id);

    if (item) {
      // Direct page generation - write immediately
      const baseName = getBaseName(item.name);
      const builder = itemPageBuilder([item]);
      writePageToFile(builder, "item", baseName, item.id.toString(), false);

      if (Context.renders) {
        renderItems(item);
      }
    }
  } catch (e) {
    console.error(`Error generating page for item ${id}: `, e);
  }
};

const addItemToMap = (item: Item) => {
  const baseName = getBaseName(item.name);
  if (!itemNameMap.has(baseName)) {
    itemNameMap.set(baseName, []);
  }
  const itemList = itemNameMap.get(baseName);
  if (itemList) {
    itemList.push(item);
  }
};

/**
 * Add item to the name map for deferred writing.
 * Used by the differences command to collect items during diff processing.
 * Call flushItemPages() after all items are collected to write combined pages.
 */
export const writeItemPage = async (item: Item) => {
  // Add item to the name map for grouping - don't write yet!
  addItemToMap(item);
};

/**
 * Write all collected item pages. Should be called after all items have been
 * added via writeItemPage(). This ensures items with the same base name
 * are properly combined into a single page.
 */
export const flushItemPages = async () => {
  for (const [baseName, items] of itemNameMap.entries()) {
    // Skip if already processed
    if (processedItems.has(baseName)) {
      continue;
    }
    processedItems.add(baseName);

    const builder = itemPageBuilder(items);

    // Use the first item's ID for the file name
    writePageToFile(
      builder,
      "item",
      baseName,
      items[0].id.toString(),
      items.length > 1
    );

    if (Context.renders) {
      // Render all items with this base name
      items.forEach((item) => renderItems(item));
    }
  }
};

// Export for testing/debugging
export const getItemNameMap = () => itemNameMap;
export const clearItemNameMap = () => {
  itemNameMap.clear();
  processedItems.clear();
};
