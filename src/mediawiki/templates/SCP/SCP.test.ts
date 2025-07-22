import SCP from "./SCP";

describe("SCP Template", () => {
  it("should render basic SCP with skill and level", () => {
    const scp = SCP({
      skill: "Agility",
      level: 61,
      link: true,
    });

    expect(scp).toMatchSnapshot();
  });

  it("should render SCP with experience instead of level", () => {
    const scp = SCP({
      skill: "Mining",
      experience: 40000,
      link: true,
    });

    expect(scp).toMatchSnapshot();
  });

  it("should render SCP with non-skill clickpic", () => {
    const scp = SCP({
      skill: "combat",
      level: 85,
      link: true,
    });

    expect(scp).toMatchSnapshot();
  });

  it("should handle optional parameters", () => {
    const scp = SCP({
      skill: "Thieving",
      level: 62,
      link: false,
      name: "Custom Name",
      txt: "Custom Text",
    });

    expect(scp).toMatchSnapshot();
  });

  it("should work without optional parameters", () => {
    const scp = SCP({
      skill: "Strength",
      level: 58,
    });

    expect(scp).toMatchSnapshot();
  });
});
