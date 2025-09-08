import { musicPageBuilder } from "./music";

import { MusicTrack } from "@/types/music";

// Mock Context module
jest.mock("@/context", () => ({
  default: {
    updateDate: "2024-09-25T00:00:00.000Z",
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
      "in Quetzacalli Gorge.",
      234
    );

    const builder = musicPageBuilder(mockMusicTrack);
    const result = builder.build();

    expect(result).toMatchSnapshot();
  });

  it("should handle quest detection properly", () => {
    const questTrack = createMockMusicTrack(
      "Quest Track",
      "Quest Track",
      "during a quest.",
      180
    );

    const nonQuestTrack = createMockMusicTrack(
      "Regular Track",
      "Regular Track",
      "in an area.",
      120
    );

    const questBuilder = musicPageBuilder(questTrack);
    const questResult = questBuilder.build();

    const nonQuestBuilder = musicPageBuilder(nonQuestTrack);
    const nonQuestResult = nonQuestBuilder.build();

    // The quest detection happens in the InfoboxMusic template
    expect(questResult).toContain("quest = Yes");
    expect(nonQuestResult).toContain("quest = No");
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
