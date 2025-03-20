import { getFieldDifferencesRow } from "../builder.utils";

describe("differences builder utils", () => {
  test("getFieldDifferencesRow - one difference", () => {
    expect(
      getFieldDifferencesRow(
        { test: { oldValue: "test removed", newValue: "test added" } },
        "test"
      )
    ).toMatchSnapshot();
  });

  test("getFieldDifferencesRow - multiple difference", () => {
    expect(
      getFieldDifferencesRow(
        {
          test: {
            oldValue: "test removed first",
            newValue: "test added second",
          },
        },
        "test"
      )
    ).toMatchSnapshot();
  });
});
