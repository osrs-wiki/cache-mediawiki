import { BoostableTemplate } from "./Boostable";

describe("BoostableTemplate", () => {
  it("formats boostable state", () => {
    expect(new BoostableTemplate({ boostable: true }).build().build()).toBe(
      "{{Boostable|yes}}\n"
    );
    expect(new BoostableTemplate({ boostable: false }).build().build()).toBe(
      "{{Boostable|no}}\n"
    );
  });
});
