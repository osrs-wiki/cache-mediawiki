import { getDirections, formatMapAnswer, formatAnswers } from "./clue.utils";

describe("clue utils", () => {
  describe("getDirections", () => {
    it("should return directions for NPC type", () => {
      const result = getDirections("clue", "npc", "Bob the Builder");
      expect(result).toBe(
        "The clue reveals who to speak to:<br><br>Bob the Builder"
      );
    });

    it("should return directions for object type", () => {
      const result = getDirections("clue", "object", "a chest in the castle");
      expect(result).toBe(
        "The clue reveals where to search:<br><br>a chest in the castle"
      );
    });

    it("should return directions for map type", () => {
      const result = getDirections("clue", "map", "the marked spot");
      expect(result).toBe(
        "The clue reveals where to dig:<br><br>the marked spot"
      );
    });

    it("should return empty directions for unknown type", () => {
      const result = getDirections("clue", "unknown", "some location");
      expect(result).toBe("The clue reveals <br><br>some location");
    });
  });

  describe("formatMapAnswer", () => {
    it("should format a map answer with a fairy ring", () => {
      const result = formatMapAnswer(
        "Use the fairy ring (BKR) to reach the location."
      );
      expect(result).toBe(
        "use the [[fairy ring]] {{Fairycode|BKR}} to reach the location."
      );
    });

    it("should format a map answer without a fairy ring", () => {
      const result = formatMapAnswer("Dig near the old oak tree.");
      expect(result).toBe("dig near the old oak tree.");
    });

    it("should handle multiple fairy rings in the answer", () => {
      const result = formatMapAnswer("Use the fairy ring (BKR).");
      expect(result).toBe("use the [[fairy ring]] {{Fairycode|BKR}}.");
    });

    it("should handle answers without any special formatting", () => {
      const result = formatMapAnswer("Walk to the marked spot.");
      expect(result).toBe("walk to the marked spot.");
    });
  });

  describe("formatAnswers", () => {
    it("should format NPC answers correctly", () => {
      const result = formatAnswers([
        {
          type: "npc",
          answer: "to the east of the castle",
          entityName: "Bob",
          worldLocs: [],
        },
      ]);
      expect(result).toBe("Speak to [[Bob]] to the east of the castle");
    });

    it("should format object answers correctly", () => {
      const result = formatAnswers([
        {
          type: "object",
          answer: "the chest",
          entityName: "Castle",
          worldLocs: [],
        },
      ]);
      expect(result).toBe("Search the castle near the chest");
    });

    it("should format map answers correctly", () => {
      const result = formatAnswers([
        {
          type: "map",
          answer: "Use the fairy ring (BKR)",
          entityName: "",
          worldLocs: [],
        },
      ]);
      expect(result).toBe("Dig use the [[fairy ring]] {{Fairycode|BKR}}");
    });

    it("should format emote answers correctly", () => {
      const result = formatAnswers(
        [
          {
            type: "emote",
            answer: "the fountain",
            entityName: "",
            worldLocs: [],
          },
        ],
        [5, 6]
      );
      expect(result).toBe(
        "Perform the [[wave]] and [[shrug]] emotes near the fountain"
      );
    });

    it("should handle unknown answer types", () => {
      const result = formatAnswers([
        {
          type: "unknown",
          answer: "some random text",
          entityName: "",
          worldLocs: [],
        },
      ]);
      expect(result).toBe("some random text");
    });
  });
});
