import { SyncedSwitch } from "./SyncedSwitch";

describe("SyncedSwitch", () => {
  test("should create synced switch with single version", () => {
    const syncedSwitch = new SyncedSwitch([
      { version: 1, content: "[[File:Test.png|130px|left]]" },
    ]);

    const result = syncedSwitch.build().build();
    expect(result).toMatchSnapshot();
  });

  test("should create synced switch with multiple versions", () => {
    const syncedSwitch = new SyncedSwitch([
      { version: 1, content: "[[File:Test.png|130px|left]]" },
      { version: 2, content: "[[File:Test (2).png|130px|left]]" },
      { version: 3, content: "[[File:Test (3).png|130px|left]]" },
    ]);

    const result = syncedSwitch.build().build();
    expect(result).toMatchSnapshot();
  });

  test("should create synced switch for NPC chatheads", () => {
    const syncedSwitch = new SyncedSwitch([
      { version: 1, content: "[[File:Guard chathead.png|130px|left]]" },
      { version: 2, content: "[[File:Guard (2) chathead.png|130px|left]]" },
      { version: 3, content: "[[File:Guard (3) chathead.png|130px|left]]" },
      { version: 4, content: "[[File:Guard (4) chathead.png|130px|left]]" },
    ]);

    const result = syncedSwitch.build().build();
    expect(result).toMatchSnapshot();
  });

  test("should create synced switch for item details", () => {
    const syncedSwitch = new SyncedSwitch([
      { version: 1, content: "[[File:Crate of wine detail.png|130px|left]]" },
      {
        version: 2,
        content: "[[File:Crate of wine (2) detail.png|130px|left]]",
      },
      {
        version: 3,
        content: "[[File:Crate of wine (3) detail.png|130px|left]]",
      },
    ]);

    const result = syncedSwitch.build().build();
    expect(result).toMatchSnapshot();
  });
});
