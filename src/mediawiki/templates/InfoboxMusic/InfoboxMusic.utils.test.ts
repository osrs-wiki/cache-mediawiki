import { formatDuration, isQuestTrack, dbRowToMusicTrack } from "./InfoboxMusic.utils";

import { DBRow, DBRowID, DBTableID } from "@/utils/cache2";

describe("InfoboxMusic utils", () => {
  describe("formatDuration", () => {
    it("should format duration correctly for valid seconds", () => {
      expect(formatDuration(234)).toBe("3:54");
      expect(formatDuration(60)).toBe("1:00");
      expect(formatDuration(125)).toBe("2:05");
      expect(formatDuration(3661)).toBe("61:01");
    });

    it("should return undefined for invalid durations", () => {
      expect(formatDuration(0)).toBeUndefined();
      expect(formatDuration(-5)).toBeUndefined();
      expect(formatDuration(undefined)).toBeUndefined();
    });

    it("should handle edge cases", () => {
      expect(formatDuration(1)).toBe("0:01");
      expect(formatDuration(59)).toBe("0:59");
    });
  });

  describe("isQuestTrack", () => {
    it("should detect quest tracks from hints", () => {
      expect(isQuestTrack("This track unlocks during a quest.")).toBe(true);
      expect(isQuestTrack("Complete the Quest for this track")).toBe(true);
      expect(isQuestTrack("Available after QUEST completion")).toBe(true);
    });

    it("should return false for non-quest tracks", () => {
      expect(isQuestTrack("This track unlocks in Varrock.")).toBe(false);
      expect(isQuestTrack("Unlocks in the wilderness")).toBe(false);
      expect(isQuestTrack("Available in all areas")).toBe(false);
    });

    it("should handle empty or undefined hints", () => {
      expect(isQuestTrack("")).toBe(false);
      expect(isQuestTrack(undefined)).toBe(false);
    });
  });

  describe("dbRowToMusicTrack", () => {
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

    it("should convert DBRow to MusicTrack correctly", () => {
      const dbRow = createMockDBRow("test_track", "Test Track", "Test hint", 234);
      const musicTrack = dbRowToMusicTrack(dbRow);

      expect(musicTrack).toEqual({
        sortName: "test_track",
        displayName: "Test Track",
        unlockHint: "Test hint",
        duration: 234,
        id: 123,
        midi: 280,
        variables: [25, 12],
        areas: undefined,
        metadata: undefined,
        extraData: [],
      });
    });

    it("should handle missing values gracefully", () => {
      const mockDBRow = new DBRow(456 as DBRowID);
      mockDBRow.table = 44 as DBTableID;
      mockDBRow.values = [];
      
      const musicTrack = dbRowToMusicTrack(mockDBRow);

      expect(musicTrack).toEqual({
        sortName: "",
        displayName: "",
        unlockHint: "",
        duration: 0,
        id: 456,
        midi: undefined,
        variables: undefined,
        areas: undefined,
        metadata: undefined,
        extraData: [],
      });
    });
  });
});