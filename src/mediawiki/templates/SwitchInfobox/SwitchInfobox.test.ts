import { SwitchInfobox } from "./SwitchInfobox";

describe("SwitchInfobox", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build switch infobox with multiple items", () => {
    const items = [
      { text: "Royal servant", item: "{{Infobox NPC|name=Ennius Tullus}}" },
      { text: "In combat", item: "{{Infobox Monster|name=Ennius Tullus}}" },
    ];
    const template = new SwitchInfobox(items);
    const result = template.build();

    expect(result.name).toBe("Switch infobox");
    expect(result.build()).toMatchSnapshot();
  });

  it("should build switch infobox with three items", () => {
    const items = [
      { text: "Royal servant", item: "{{Infobox NPC|name=Ennius Tullus}}" },
      { text: "Cultist", item: "{{Infobox NPC|name=Ennius Tullus (cultist)}}" },
      { text: "In combat", item: "{{Infobox Monster|name=Ennius Tullus}}" },
    ];
    const template = new SwitchInfobox(items);
    const result = template.build();

    expect(result.name).toBe("Switch infobox");
    expect(result.build()).toMatchSnapshot();
  });

  it("should handle empty items array", () => {
    const items: { text: string; item: string }[] = [];
    const template = new SwitchInfobox(items);
    const result = template.build();

    expect(result.name).toBe("Switch infobox");
    expect(result.build()).toMatchSnapshot();
  });

  it("should handle single item", () => {
    const items = [{ text: "Default", item: "{{Infobox NPC|name=Test NPC}}" }];
    const template = new SwitchInfobox(items);
    const result = template.build();

    expect(result.name).toBe("Switch infobox");
    expect(result.build()).toMatchSnapshot();
  });
});
