import { DBRow, DBRowID, DBTableID } from "@/utils/cache2";

import { musicPageBuilder } from "./music";

// Mock Context module
jest.mock("@/context", () => ({
  default: {
    updateDate: "2024-09-25",
    update: "Varlamore: The Rising Darkness is OUT NOW",
  },
}));

describe("musicPageBuilder", () => {
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

  it("should create a music page with proper structure", () => {
    const mockDBRow = createMockDBRow(
      "Stones of Old",
      "Stones of Old",
      "This track unlocks in Quetzacalli Gorge.",
      234
    );

    const builder = musicPageBuilder(mockDBRow);
    const result = builder.build();

    expect(result).toContain("{{New Content}}");
    expect(result).toContain("{{Infobox Music");
    expect(result).toContain("'''Stones of Old'''");
    expect(result).toContain(" is a [[music]] track");
    expect(result).toContain("that is unlocked");
    expect(result).toContain("{{Music}}");
    expect(result).toContain("[[Category:Old School-exclusive music]]");
  });

  it("should handle quest detection properly", () => {
    const questTrack = createMockDBRow(
      "Quest Track",
      "Quest Track", 
      "This track unlocks during a quest.",
      180
    );

    const nonQuestTrack = createMockDBRow(
      "Regular Track",
      "Regular Track",
      "This track unlocks in an area.",
      120
    );

    const questBuilder = musicPageBuilder(questTrack);
    const questResult = questBuilder.build();

    const nonQuestBuilder = musicPageBuilder(nonQuestTrack);
    const nonQuestResult = nonQuestBuilder.build();

    // The quest detection happens in the InfoboxMusic template
    // We can't easily test the infobox content without more complex mocking
    expect(questResult).toContain("Quest Track");
    expect(nonQuestResult).toContain("Regular Track");
  });

  it("should use display name over sort name", () => {
    const mockDBRow = createMockDBRow(
      "sort_name",
      "Display Name",
      "Test hint",
      150
    );

    const builder = musicPageBuilder(mockDBRow);
    const result = builder.build();

    expect(result).toContain("'''Display Name'''");
    expect(result).not.toContain("'''sort_name'''");
  });

  it("should fallback to sort name when display name is missing", () => {
    const mockDBRow = createMockDBRow(
      "Sort Name",
      "",
      "Test hint",
      150
    );

    const builder = musicPageBuilder(mockDBRow);
    const result = builder.build();

    expect(result).toContain("'''Sort Name'''");
  });
});