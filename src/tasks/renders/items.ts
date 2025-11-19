import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "@/context";
import { Item } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";
import { getBaseName } from "@/utils/string";

// Global map to track item name counts for versioning
const itemNameCounts = new Map<string, number>();

export const renderItems = async (item: Item) => {
  if (item.name.toLocaleLowerCase() === "null") {
    return;
  }

  if (!Context.renders) {
    // console.warn("Context.renders is not defined. Skipping item rendering.");
    return;
  }

  // Get base name and track count for versioning
  const baseName = getBaseName(item.name);
  const currentCount = itemNameCounts.get(baseName) || 0;
  itemNameCounts.set(baseName, currentCount + 1);

  // Determine the display name (first one has no number, subsequent ones get (2), (3), etc.)
  const displayName =
    currentCount === 0 ? baseName : `${baseName} (${currentCount + 1})`;

  try {
    const itemBaseOutDir = `./out/${Context.renders}/item`;
    const miniItemBaseOutDir = `./out/${Context.renders}/miniitems`;
    await mkdir(itemBaseOutDir, { recursive: true });
    await mkdir(miniItemBaseOutDir, { recursive: true });

    const itemSrcBasePath = `./data/${Context.renders}/item`;
    const miniItemSrcBasePath = `./data/${Context.renders}/miniitems`;

    // Determine if the item has actual stack variants defined
    const hasStackVariants = item.stackVariantItems.some((id) => id !== 0);

    // Main item rendering
    const mainItemNameSuffix = hasStackVariants ? " 1" : "";
    const mainItemDetailDest = formatFileName(
      `${itemBaseOutDir}/${displayName}${mainItemNameSuffix} detail.png`
    );
    const mainItemMiniDest = formatFileName(
      `${miniItemBaseOutDir}/${displayName}${mainItemNameSuffix}.png`
    );

    const mainItemSrcPath = `${itemSrcBasePath}/${item.id}.png`;
    if (existsSync(mainItemSrcPath)) {
      await copyFile(mainItemSrcPath, mainItemDetailDest);
    }

    const mainMiniItemSrcPath = `${miniItemSrcBasePath}/${item.id}.png`;
    if (existsSync(mainMiniItemSrcPath)) {
      await copyFile(mainMiniItemSrcPath, mainItemMiniDest);
    }

    // Stacked variants rendering
    if (hasStackVariants) {
      if (
        item.stackVariantItems.length !== item.stackVariantQuantities.length
      ) {
        console.error(
          `Mismatch in stack variant lengths for item ${item.name} (ID: ${item.id}). Skipping stack variants rendering.`
        );
        return;
      }
      const filteredStackVariants = item.stackVariantItems.filter(
        (id) => id !== 0
      );
      const filteredStackQuantities = item.stackVariantQuantities.filter(
        (quantity) => quantity !== 0
      );
      for (let i = 0; i < filteredStackVariants.length; i++) {
        const stackItemId = filteredStackVariants[i];
        const quantity = filteredStackQuantities[i];

        if (stackItemId === 0 || quantity === 0) {
          continue;
        }

        // Destination names use the display name and the specific quantity for this variant
        const stackItemDestDetailPath = formatFileName(
          `${itemBaseOutDir}/${displayName} ${
            i < filteredStackQuantities.length - 1 ? quantity : ""
          } detail.png`
        );
        const stackItemDestMiniPath = formatFileName(
          `${miniItemBaseOutDir}/${displayName} ${quantity}.png`
        );

        // Source paths use the stackItemId
        const stackItemSrcDetailPath = `${itemSrcBasePath}/${stackItemId}.png`;
        if (existsSync(stackItemSrcDetailPath)) {
          await copyFile(stackItemSrcDetailPath, stackItemDestDetailPath);
        }

        const stackItemSrcMiniPath = `${miniItemSrcBasePath}/${stackItemId}.png`;
        if (existsSync(stackItemSrcMiniPath)) {
          await copyFile(stackItemSrcMiniPath, stackItemDestMiniPath);
        }
      }
    }
  } catch (e) {
    console.error(`Error rendering item ${item.name} (ID: ${item.id}):`, e);
  }
};

// Export for testing/debugging
export const getItemNameCounts = () => itemNameCounts;
export const clearItemNameCounts = () => itemNameCounts.clear();
