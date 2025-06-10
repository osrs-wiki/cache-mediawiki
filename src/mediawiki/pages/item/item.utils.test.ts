import { MediaWikiBuilder } from "@osrs-wiki/mediawiki-builder";

import { generateItemStackGallery } from "./item.utils";
import { Item, ItemID } from "../../../utils/cache2";

describe("generateItemStackGallery", () => {
  const baseItem: Item = {
    name: "Test Item",
    stackVariantItems: [0, 2, 3],
    stackVariantQuantities: [3, 5, 10],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  it("generates gallery with stack variants", () => {
    const builder = new MediaWikiBuilder();
    builder.addContents(generateItemStackGallery(baseItem));
    expect(builder.build()).toMatchSnapshot();
  });

  it("handles empty stackVariantItems", () => {
    const item: Item = {
      ...baseItem,
      stackVariantItems: [],
      stackVariantQuantities: [],
    };
    const builder = new MediaWikiBuilder();
    builder.addContents(generateItemStackGallery(item));
    expect(builder.build()).toMatchSnapshot();
  });

  it("skips stackVariantItems with id 0", () => {
    const item: Item = {
      ...baseItem,
      stackVariantItems: [0 as ItemID, 0 as ItemID, 3 as ItemID],
      stackVariantQuantities: [2, 3, 4],
    };
    const builder = new MediaWikiBuilder();
    builder.addContents(generateItemStackGallery(item));
    expect(builder.build()).toMatchSnapshot();
  });
});
