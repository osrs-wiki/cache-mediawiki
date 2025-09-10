import cluePageBuilder from "./clue";
import { CluePageBuilderProps } from "./clue.types";

// Mock Context
jest.mock("@/context", () => ({
  updateDate: "2023-01-01",
  update: "Test Update"
}));

describe("cluePageBuilder", () => {
  const baseProps: CluePageBuilderProps = {
    id: "test-id",
    clue: "Test clue description",
    itemName: "Clue scroll (medium)",
    tier: "medium",
    type: "coordinate",
    answers: [{
      answer: "test location",
      entityName: "Test NPC",
      type: "npc",
      worldLocs: [[3200, 3200, 0]]
    }],
  };

  describe("challenges formatting", () => {
    it("should handle no challenges", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: []
      });
      
      const result = builder.build();
      expect(result).not.toContain("challenge");
    });

    it("should format single challenge with existing text format", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: [{
          task: "Question: ''What is 2+2?''",
          answer: "Answer: '''4'''"
        }]
      });
      
      const result = builder.build();
      expect(result).toContain("The clue has an additional challenge:");
      expect(result).toContain("Question: ''What is 2+2?''");
      expect(result).toContain("Answer: '''4'''");
    });

    it("should format single challenge with task only", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: [{
          task: "Complete the puzzle",
          answer: ""
        }]
      });
      
      const result = builder.build();
      expect(result).toContain("The clue has an additional challenge:");
      expect(result).toContain("Complete the puzzle");
    });

    it("should format single challenge with answer only", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: [{
          task: "",
          answer: "Kill a [[Goblin]]."
        }]
      });
      
      const result = builder.build();
      expect(result).toContain("The clue has an additional challenge:");
      expect(result).toContain("Kill a [[Goblin]].");
    });

    it("should format multiple challenges with new text format", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: [
          {
            task: "Question: ''What is 2+2?''",
            answer: "Answer: '''4'''"
          },
          {
            task: "Complete the puzzle",
            answer: ""
          },
          {
            task: "",
            answer: "Kill a [[Goblin]]."
          }
        ]
      });
      
      const result = builder.build();
      expect(result).toContain("The clue will have one of the following challenges:");
      expect(result).toContain("- Question: ''What is 2+2?''");
      expect(result).toContain("  Answer: '''4'''");
      expect(result).toContain("- Complete the puzzle");
      expect(result).toContain("- Kill a [[Goblin]].");
    });

    it("should format two challenges correctly", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        challenges: [
          {
            task: "First challenge",
            answer: "First answer"
          },
          {
            task: "Second challenge", 
            answer: "Second answer"
          }
        ]
      });
      
      const result = builder.build();
      expect(result).toContain("The clue will have one of the following challenges:");
      expect(result).toContain("- First challenge");
      expect(result).toContain("  First answer");
      expect(result).toContain("- Second challenge");
      expect(result).toContain("  Second answer");
    });
  });

  describe("integration with other components", () => {
    it("should work with requirements and challenges", () => {
      const builder = cluePageBuilder({
        ...baseProps,
        requirements: ["[[Rope]]", "{{SCP|Agility|50|link=yes}}"],
        challenges: [{
          task: "Test challenge",
          answer: "Test answer"
        }]
      });
      
      const result = builder.build();
      expect(result).toContain("Requires: [[Rope]], {{SCP|Agility|50|link=yes}}");
      expect(result).toContain("The clue has an additional challenge:");
      expect(result).toContain("Test challenge");
      expect(result).toContain("Test answer");
    });
  });
});