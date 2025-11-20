import { MediaWikiText } from "@osrs-wiki/mediawiki-builder";

import { ObjectLocLineTemplate } from "./ObjectLocLine";

describe("ObjectLocLineTemplate", () => {
  it("should build ObjectLocLine template with single coordinate", () => {
    const template = new ObjectLocLineTemplate({
      name: "Lead rocks",
      location: new MediaWikiText("Deepfin Point"),
      members: true,
      coordinates: [{ x: 1935, y: 2795 }],
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should build ObjectLocLine template with multiple coordinates", () => {
    const template = new ObjectLocLineTemplate({
      name: "Lead rocks",
      location: new MediaWikiText("Deepfin Point"),
      members: true,
      coordinates: [
        { x: 1935, y: 2795 },
        { x: 1933, y: 2794 },
        { x: 1936, y: 2794 },
        { x: 1934, y: 2792 },
        { x: 1932, y: 2791 },
        { x: 1930, y: 2789 },
        { x: 1939, y: 2789 },
      ],
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should handle coordinates with plane", () => {
    const template = new ObjectLocLineTemplate({
      name: "Lead rocks",
      location: new MediaWikiText("Deepfin Mine"),
      members: true,
      coordinates: [
        { x: 1997, y: 9203, plane: 1 },
        { x: 1997, y: 9205, plane: 1 },
        { x: 1999, y: 9209, plane: 1 },
      ],
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should handle non-members location", () => {
    const template = new ObjectLocLineTemplate({
      name: "Tree",
      location: new MediaWikiText("Lumbridge"),
      members: false,
      coordinates: [{ x: 3200, y: 3200 }],
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should handle all optional parameters", () => {
    const template = new ObjectLocLineTemplate({
      name: "Fishing spot",
      location: new MediaWikiText("Fishing Guild"),
      members: true,
      coordinates: [{ x: 2600, y: 3400 }],
      mapID: 1,
      mtype: "pin",
      spawns: "5",
      width: 200,
      height: 200,
    });

    expect(template.build().build()).toMatchSnapshot();
  });

  it("should handle location with question mark", () => {
    const template = new ObjectLocLineTemplate({
      name: "Unknown Scenery",
      location: new MediaWikiText("?"),
      members: true,
      coordinates: [{ x: 3000, y: 3000 }],
      mapID: -1,
      mtype: "pin",
    });

    expect(template.build().build()).toMatchSnapshot();
  });
});
