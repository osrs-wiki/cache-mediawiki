import sceneryPageBuilder from "./scenery";

import Context from "@/context";
import { ObjID } from "@/utils/cache2";

describe("sceneryPageBuilder", () => {
  it("build scenery page", async () => {
    Context.update = "update";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "name",
      actions: ["action1", "action2"],
      id: 1 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();
  });

  it("build scenery page with beta id", async () => {
    const originalBeta = Context.beta;
    Context.beta = true;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "name",
      actions: ["action1", "action2"],
      id: 1 as ObjID,
    });
    expect(builder?.build()).toMatchSnapshot();

    Context.beta = originalBeta;
  });

  it("should strip HTML tags from scenery name in page content", async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Do not require all fields
    const builder = await sceneryPageBuilder({
      name: "<col=ff0000>Red Chest</col>",
      actions: ["Open", "Search"],
      id: 123 as ObjID,
    });
    const pageContent = builder?.build();
    expect(pageContent).toContain("|name = Red Chest");
    expect(pageContent).toContain("[[File:Red Chest.png]]");
    expect(pageContent).toContain("'''Red Chest'''");
    expect(pageContent).not.toContain("<col=ff0000>");
    expect(pageContent).not.toContain("</col>");
  });
});
