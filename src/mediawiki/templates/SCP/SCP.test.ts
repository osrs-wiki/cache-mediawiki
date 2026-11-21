import { SCPTemplate } from "./SCP";

describe("SCPTemplate", () => {
  it("builds a linked skill and level", () => {
    expect(
      new SCPTemplate({
        skill: "Slayer",
        level: 58,
        link: true,
      })
        .build()
        .build()
    ).toBe("{{SCP|Slayer|58|link=yes}}\n");
  });

  it("builds a skill without a level", () => {
    expect(new SCPTemplate({ skill: "Combat" }).build().build()).toBe(
      "{{SCP|Combat}}\n"
    );
  });
});
