import InfoboxSceneryTemplate from "./InfoboxScenery";

import { Obj, ObjID, Params } from "@/utils/cache2";

// Helper function to create mock scenery objects for testing
const createMockScenery = (
  name: string,
  id: number,
  actions: string[] = []
): Obj =>
  ({
    name,
    id: id as ObjID,
    actions,
    params: new Params(),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

describe("InfoboxSceneryTemplate", () => {
  it("should strip HTML tags from scenery name", () => {
    const scenery = createMockScenery("<col=00ffff>Magic Door</col>", 1234, [
      "Open",
    ]);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that the name parameter is stripped of HTML tags
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Magic Door");

    // Verify that the image filename is also stripped of HTML tags
    const imageParam = templateParams.find((p) => p.key === "image");
    expect(imageParam?.value).toContain("Magic Door.png");
    expect(imageParam?.value).not.toContain("<col=");
    expect(imageParam?.value).not.toContain("</col>");
  });

  it("should handle scenery names without HTML tags", () => {
    const scenery = createMockScenery("Door", 5678, ["Open", "Close"]);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that normal names are preserved
    const templateParams = built.params || [];
    const nameParam = templateParams.find((p) => p.key === "name");
    expect(nameParam?.value).toBe("Door");
  });

  it("should include actions as options", () => {
    const scenery = createMockScenery("Chest", 9012, [
      "Open",
      "Search",
      "Examine",
    ]);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built).toMatchSnapshot();

    // Verify that actions are included as options
    const templateParams = built.params || [];
    const optionsParam = templateParams.find((p) => p.key === "options");
    expect(optionsParam?.value).toContain("Open");
    expect(optionsParam?.value).toContain("Search");
    expect(optionsParam?.value).toContain("Examine");
  });

  it("should set correct template name", () => {
    const scenery = createMockScenery("Test Scenery", 1111);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built.name).toBe("Infobox Scenery");
  });

  it("should handle scenery with no actions", () => {
    const scenery = createMockScenery("Rock", 2222, []);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built).toMatchSnapshot();
  });

  it("should include examine text when available", () => {
    const scenery = createMockScenery("Mysterious Door", 3333, ["Open"]);

    const template = InfoboxSceneryTemplate(scenery);
    const built = template.build();

    expect(built).toMatchSnapshot();
  });
});
