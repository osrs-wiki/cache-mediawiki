import { MapTemplate } from "./Map";

describe("MapTemplate", () => {
  it("should build map template with basic params", () => {
    const template = new MapTemplate({
      x: 1231,
      y: 3728,
      plane: 0,
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should build map template with name", () => {
    const template = new MapTemplate({
      name: "Cave (Farming Guild)",
      x: 1231,
      y: 3728,
      plane: 0,
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should build map template with all params", () => {
    const template = new MapTemplate({
      name: "Test Location",
      x: 3000,
      y: 3000,
      plane: 2,
      mapID: 1,
      mtype: "pin",
      width: 200,
      height: 200,
      zoom: 2,
      label: "Test Label",
      link: "Test Page",
      description: "A test description",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should handle optional plane parameter", () => {
    const template = new MapTemplate({
      x: 2500,
      y: 3500,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should support coordinates object format", () => {
    const template = new MapTemplate({
      name: "Test Location",
      coordinates: { x: 3000, y: 3500, plane: 1 },
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should support multiple coordinates array format", () => {
    const template = new MapTemplate({
      name: "Multiple Locations",
      coordinates: [
        { x: 3000, y: 3500 },
        { x: 3005, y: 3505 },
        { x: 3010, y: 3510, plane: 1 },
      ],
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });
});
