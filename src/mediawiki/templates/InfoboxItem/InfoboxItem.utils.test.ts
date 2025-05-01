import { getInventoryActions } from "./InfoboxItem.utils";

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
});
