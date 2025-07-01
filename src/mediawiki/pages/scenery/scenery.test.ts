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
});
