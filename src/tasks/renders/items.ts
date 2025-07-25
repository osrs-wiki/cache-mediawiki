import { existsSync } from "fs";
import { copyFile, mkdir } from "fs/promises";

import Context from "@/context";
import { Item } from "@/utils/cache2";
import { formatFileName } from "@/utils/files";

export const renderItems = async (item: Item) => {
  if (item.name.toLocaleLowerCase() === "null") {
    return;
  }

  if (!Context.renders) {
    // console.warn("Context.renders is not defined. Skipping item rendering.");
    return;
  }

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
      `${itemBaseOutDir}/${item.name}${mainItemNameSuffix} detail.png`
    );
    const mainItemMiniDest = formatFileName(
      `${miniItemBaseOutDir}/${item.name}${mainItemNameSuffix}.png`
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

        // Destination names use the original item's name and the specific quantity for this variant
        const stackItemDestDetailPath = formatFileName(
          `${itemBaseOutDir}/${item.name} ${
            i < filteredStackQuantities.length - 1 ? quantity : ""
          } detail.png`
        );
        const stackItemDestMiniPath = formatFileName(
          `${miniItemBaseOutDir}/${item.name} ${quantity}.png`
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
