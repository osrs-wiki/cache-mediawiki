import { MediaWikiLink } from "@osrs-wiki/mediawiki-builder";

import InfoboxLocation from "./InfoboxLocation";

import Context from "@/context";
import { Area, AreaID } from "@/utils/cache2";

const BASE_LOCATION: Area = {
  name: "The White Cliffs of Lova",
  id: 1234 as AreaID,
  field3292: [],
  spriteId: -1,
  field3294: -1,
  textColor: 0,
  category: -1,
  field3298: [null, null, null, null, null],
  field3300: [],
  field3308: "",
  field3309: [],
  textScale: 1,
} as Area;

describe("InfoboxLocation", () => {
  test("InfoboxLocation - base", () => {
    const location = InfoboxLocation(BASE_LOCATION);
    expect(location.build()).toMatchSnapshot();
  });

  test("InfoboxLocation - with context", () => {
    Context.update = "Test Update";

    const location = InfoboxLocation(BASE_LOCATION);
    expect(location.build()).toMatchSnapshot();
  });

  test("InfoboxLocation - with map parameter", () => {
    const mapTemplate =
      "{{Map|name=The White Cliffs of Lova|x=2664|y=3102|plane=0|mapID=-1|mtype=pin}}";
    const location = InfoboxLocation(BASE_LOCATION, mapTemplate);
    expect(location.build()).toMatchSnapshot();
  });

  test("InfoboxLocation - with nearest location parameter", () => {
    const mapTemplate =
      "{{Map|name=The White Cliffs of Lova|x=2664|y=3102|plane=0|mapID=-1|mtype=pin}}";
    const nearestLocation = new MediaWikiLink("Strait of Khazard");
    const location = InfoboxLocation(
      BASE_LOCATION,
      mapTemplate,
      nearestLocation
    );
    expect(location.build()).toMatchSnapshot();
  });
});
