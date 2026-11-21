import { HastranscriptTemplate } from "./Hastranscript";

describe("HastranscriptTemplate", () => {
  it("builds a bare link box with no parameters", () => {
    expect(new HastranscriptTemplate().build().build()).toBe(
      "{{Hastranscript}}\n"
    );
  });

  it("builds a link box with a type", () => {
    expect(new HastranscriptTemplate({ type: "npc" }).build().build()).toBe(
      "{{Hastranscript|npc}}\n"
    );
  });

  it("builds a link box for each documented type", () => {
    const types = [
      "npc",
      "speaksin",
      "pet",
      "skill",
      "quest",
      "miniquest",
      "event",
      "item",
      "scenery",
    ] as const;

    types.forEach((type) => {
      expect(new HastranscriptTemplate({ type }).build().build()).toBe(
        `{{Hastranscript|${type}}}\n`
      );
    });
  });

  it("builds a link box with a type and an overridden link", () => {
    expect(
      new HastranscriptTemplate({
        type: "npc",
        link: "Transcript:Example NPC/Alternate",
      })
        .build()
        .build()
    ).toBe("{{Hastranscript|npc|Transcript:Example NPC/Alternate}}\n");
  });

  it("builds a transclusion using the current page by default", () => {
    expect(
      new HastranscriptTemplate({ transclude: true }).build().build()
    ).toBe("{{Hastranscript|transclude=yes}}\n");
  });

  it("builds a transclusion for a single named page", () => {
    expect(
      new HastranscriptTemplate({
        transclude: true,
        pages: "Lift manual",
      })
        .build()
        .build()
    ).toBe("{{Hastranscript|Lift manual|transclude=yes}}\n");
  });

  it("builds a transclusion for multiple pages", () => {
    expect(
      new HastranscriptTemplate({
        transclude: true,
        pages: ["Lift manual", "Lift manual/part 2"],
      })
        .build()
        .build()
    ).toBe("{{Hastranscript|Lift manual|Lift manual/part 2|transclude=yes}}\n");
  });
});
