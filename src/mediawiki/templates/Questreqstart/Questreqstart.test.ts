import { QuestreqstartTemplate } from "./Questreqstart";

describe("QuestreqstartTemplate", () => {
  it("formats quest start requirement state", () => {
    expect(new QuestreqstartTemplate({ required: true }).build().build()).toBe(
      "{{Questreqstart|yes}}\n"
    );
    expect(new QuestreqstartTemplate({ required: false }).build().build()).toBe(
      "{{Questreqstart|no}}\n"
    );
  });
});
