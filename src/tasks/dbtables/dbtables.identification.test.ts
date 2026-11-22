import {
  DBTableIdentificationFile,
  identifyDBTable,
} from "./dbtables.identification";

const identifications: DBTableIdentificationFile = {
  schemaVersion: 1,
  rules: [
    {
      match: "prefix",
      value: "sailing_",
      domain: "Sailing",
      use: "feature-data",
      confidence: "high",
      wikiUse: "Populate Sailing content.",
    },
    {
      match: "prefix",
      value: "sailing_boat_",
      domain: "Sailing boats",
      use: "enrichment",
      confidence: "high",
      wikiUse: "Populate boat content.",
    },
    {
      match: "exact",
      value: "sailing_boat",
      domain: "Boats",
      use: "page",
      confidence: "high",
      wikiUse: "Generate boat page stubs.",
    },
  ],
};

describe("dbtables.identification", () => {
  it("prefers exact rules over prefix rules", () => {
    expect(identifyDBTable(identifications, "sailing_boat")).toEqual({
      domain: "Boats",
      use: "page",
      confidence: "high",
      wikiUse: "Generate boat page stubs.",
      notes: undefined,
    });
  });

  it("uses the longest matching prefix", () => {
    expect(identifyDBTable(identifications, "sailing_boat_hull")).toEqual({
      domain: "Sailing boats",
      use: "enrichment",
      confidence: "high",
      wikiUse: "Populate boat content.",
      notes: undefined,
    });
  });

  it("returns undefined for unidentified tables", () => {
    expect(
      identifyDBTable(identifications, "unclassified_table")
    ).toBeUndefined();
  });
});
