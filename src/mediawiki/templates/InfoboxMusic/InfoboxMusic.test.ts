import InfoboxMusicTemplate from "./InfoboxMusic";

import { MusicTrack } from "@/types/music";

// Mock Context module
jest.mock("@/context", () => ({
  default: {
    updateDate: "2024-09-25",
    update: "Varlamore: The Rising Darkness is OUT NOW",
  },
}));

describe("InfoboxMusicTemplate", () => {
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

  it("should create InfoboxMusic template with basic info", () => {
    const mockMusicTrack = createMockMusicTrack(
      "Test Track",
      "Test Track",
      "Test hint",
      234 // 3:54
    );

    const template = InfoboxMusicTemplate(mockMusicTrack);
    expect(template).toMatchSnapshot();
  });

  it("should detect quest tracks properly", () => {
    const questTrackData = createMockMusicTrack(
      "Quest Track",
      "Quest Track",
      "This track unlocks during a quest.",
      180
    );

    const template = InfoboxMusicTemplate(questTrackData);
    expect(template).toMatchSnapshot();
  });

  it("should handle missing duration gracefully", () => {
    const mockMusicTrack = createMockMusicTrack(
      "Test Track",
      "Test Track", 
      "Test hint",
      0
    );

    const template = InfoboxMusicTemplate(mockMusicTrack);
    expect(template).toMatchSnapshot();
  });

  it("should use display name over sort name", () => {
    const mockMusicTrack = createMockMusicTrack(
      "sort_name",
      "Display Name",
      "Test hint",
      150
    );

    const template = InfoboxMusicTemplate(mockMusicTrack);
    expect(template).toMatchSnapshot();
  });

  it("should fallback to sort name when display name is missing", () => {
    const mockMusicTrack = createMockMusicTrack(
      "Sort Name",
      "",
      "Test hint",
      150
    );

    const template = InfoboxMusicTemplate(mockMusicTrack);
    expect(template).toMatchSnapshot();
  });
});