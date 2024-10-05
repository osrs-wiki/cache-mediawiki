import { buildsceneryInfobox } from "./scenery";
import Context from "../../../../context";
import { ObjID } from "../../../../utils/cache2";

describe("Scenery Infobox", () => {
  it("buildsceneryInfobox", async () => {
    Context.update = "update";
    Context.updateDate = "01-01-1999";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await buildsceneryInfobox({
      name: "name",
      actions: ["action1", "action2"],
      id: 1 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();
  });
});
