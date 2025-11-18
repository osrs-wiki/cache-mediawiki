import { getVersionedImageName } from "./SyncedSwitch.utils";

describe("getVersionedImageName", () => {
  test("should generate first version without number", () => {
    expect(getVersionedImageName("Guard", 0, " chathead")).toBe(
      "Guard chathead.png"
    );
  });

  test("should generate second version with (2)", () => {
    expect(getVersionedImageName("Guard", 1, " chathead")).toBe(
      "Guard (2) chathead.png"
    );
  });

  test("should generate third version with (3)", () => {
    expect(getVersionedImageName("Crate of wine", 2, " detail")).toBe(
      "Crate of wine (3) detail.png"
    );
  });

  test("should work without suffix", () => {
    expect(getVersionedImageName("Test", 0)).toBe("Test.png");
    expect(getVersionedImageName("Test", 1)).toBe("Test (2).png");
  });

  test("should work with empty suffix", () => {
    expect(getVersionedImageName("Item name", 0, "")).toBe("Item name.png");
    expect(getVersionedImageName("Item name", 3, "")).toBe("Item name (4).png");
  });
});
