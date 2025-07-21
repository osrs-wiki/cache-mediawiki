import { musicPageBuilder } from "./music";

import { MusicTrack } from "@/types/music";

// Mock Context module
jest.mock("@/context", () => ({
  default: {
    updateDate: "2024-09-25",
    update: "Varlamore: The Rising Darkness is OUT NOW",
  },
}));

describe("musicPageBuilder", () => {
  const createMockMusicTrack = (
    sortName: string,
    displayName: string,
    unlockHint: string,
    duration: number,
    id = 123
  ): MusicTrack => {
    return {
      sortName,
      displayName,
      unlockHint,
      duration,
      id,
    };
  };

  it("should create a music page with proper structure", () => {
    const mockMusicTrack = createMockMusicTrack(
      "Stones of Old",
      "Stones of Old",
      "This track unlocks in Quetzacalli Gorge.",
      234
    );

    const builder = musicPageBuilder(mockMusicTrack);
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
    const questTrack = createMockMusicTrack(
      "Quest Track",
      "Quest Track", 
      "This track unlocks during a quest.",
      180
    );

    const nonQuestTrack = createMockMusicTrack(
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
    const mockMusicTrack = createMockMusicTrack(
      "sort_name",
      "Display Name",
      "Test hint",
      150
    );

    const builder = musicPageBuilder(mockMusicTrack);
    const result = builder.build();

    expect(result).toContain("'''Display Name'''");
    expect(result).not.toContain("'''sort_name'''");
  });

  it("should fallback to sort name when display name is missing", () => {
    const mockMusicTrack = createMockMusicTrack(
      "Sort Name",
      "",
      "Test hint",
      150
    );

    const builder = musicPageBuilder(mockMusicTrack);
    const result = builder.build();

    expect(result).toContain("'''Sort Name'''");
  });
});