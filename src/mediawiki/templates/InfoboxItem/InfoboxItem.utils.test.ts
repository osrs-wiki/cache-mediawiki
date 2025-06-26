import { getInventoryActions, getItemInfoboxImage } from "./InfoboxItem.utils";

describe("InfoboxItem utils", () => {
  test("getInventoryActions - no sub ops", () => {
    expect(
      getInventoryActions({
        inventoryActions: ["Test Action"],
        subops: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toEqual(["Test Action"]);
  });

  test("getInventoryActions - with sub ops", () => {
    expect(
      getInventoryActions({
        inventoryActions: ["Test Action 1", "Test Action 2", "Test Action 3"],
        subops: [["Sub Action 1"], ["Sub Action 2.1", "Sub Action 2.2"], []],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    ).toEqual([
      "Test Action 1 (Sub Action 1)",
      "Test Action 2 (Sub Action 2.1, Sub Action 2.2)",
      "Test Action 3",
    ]);
  });

  describe("getItemInfoboxImage", () => {
    test("returns MediaWikiFile when no stack variants", () => {
      const item = {
        name: "Test Item",
        stackVariantItems: [],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const result = getItemInfoboxImage(item);
      expect(result).toMatchSnapshot();
    });

    test("returns MediaWikiFile when all stack variants are 0", () => {
      const item = {
        name: "Test Item",
        stackVariantItems: [0, 0, 0],
        stackVariantQuantities: [0, 0, 0],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const result = getItemInfoboxImage(item);
      expect(result).toMatchSnapshot();
    });

    test("returns no break when less than 5 stack variants", () => {
      const item = {
        name: "Test Item",
        stackVariantItems: [1, 2, 3, 4],
        stackVariantQuantities: [10, 20, 30, 40],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const result = getItemInfoboxImage(item);
      expect(result).toMatchSnapshot();
    });

    test("inserts MediaWikiBreak correctly for odd number of variants", () => {
      const item = {
        name: "Odd Item",
        stackVariantItems: [1, 2, 3, 4, 5, 6, 7],
        stackVariantQuantities: [5, 15, 25, 35, 45, 55, 65],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const result = getItemInfoboxImage(item);
      expect(result).toMatchSnapshot();
    });

    test("returns array with MediaWikiBreak inserted halfway", () => {
      const item = {
        name: "Test Item",
        stackVariantItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        stackVariantQuantities: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;
      const result = getItemInfoboxImage(item);
      expect(result).toMatchSnapshot();
    });
  });
});
