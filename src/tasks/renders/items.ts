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
      for (let i = 0; i < item.stackVariantItems.length; i++) {
        const stackItemId = item.stackVariantItems[i];
        const quantity = item.stackVariantQuantities[i];

        if (stackItemId === 0 || quantity === 0) {
          continue;
        }

        // Destination names use the original item's name and the specific quantity for this variant
        const stackItemDestDetailPath = formatFileName(
          `${itemBaseOutDir}/${item.name} ${quantity} detail.png`
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
