import { DBRow, DBRowID, DBTableID } from "@/utils/cache2";

import InfoboxMusicTemplate from "./InfoboxMusic";

// Mock Context module
jest.mock("@/context", () => ({
  default: {
    updateDate: "2024-09-25",
    update: "Varlamore: The Rising Darkness is OUT NOW",
  },
}));

describe("InfoboxMusicTemplate", () => {
  const createMockDBRow = (
    sortname: string,
    displayname: string,
    unlockhint: string,
    duration: number
  ): DBRow => {
    const mockDBRow = new DBRow(123 as DBRowID);
    mockDBRow.table = 44 as DBTableID;
    mockDBRow.values = [
      [sortname],      // sortname
      [displayname],   // displayname  
      [unlockhint],    // unlockhint
      [duration],      // duration
      [280],           // midi
      [25, 12],        // variable
      undefined,       // area
      undefined,       // area_default
      undefined,       // hidden
      undefined,       // holiday
      undefined,       // secondary_track
    ];
    return mockDBRow;
  };

  it("should create InfoboxMusic template with basic info", () => {
    const mockDBRow = createMockDBRow(
      "Test Track",
      "Test Track",
      "Test hint",
      234 // 3:54
    );

    const template = InfoboxMusicTemplate(mockDBRow);
    expect(template).toMatchSnapshot();
  });

  it("should detect quest tracks properly", () => {
    const questTrackRow = createMockDBRow(
      "Quest Track",
      "Quest Track",
      "This track unlocks during a quest.",
      180
    );

    const template = InfoboxMusicTemplate(questTrackRow);
    expect(template).toMatchSnapshot();
  });

  it("should handle missing duration gracefully", () => {
    const mockDBRow = createMockDBRow(
      "Test Track",
      "Test Track", 
      "Test hint",
      0
    );

    const template = InfoboxMusicTemplate(mockDBRow);
    expect(template).toMatchSnapshot();
  });

  it("should use display name over sort name", () => {
    const mockDBRow = createMockDBRow(
      "sort_name",
      "Display Name",
      "Test hint",
      150
    );

    const template = InfoboxMusicTemplate(mockDBRow);
    expect(template).toMatchSnapshot();
  });

  it("should fallback to sort name when display name is missing", () => {
    const mockDBRow = createMockDBRow(
      "Sort Name",
      "",
      "Test hint",
      150
    );

    const template = InfoboxMusicTemplate(mockDBRow);
    expect(template).toMatchSnapshot();
  });
});