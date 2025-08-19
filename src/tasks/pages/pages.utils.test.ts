import { mkdir, writeFile } from "fs/promises";

import { writePageToFile } from "./pages.utils";

import { formatFileName } from "@/utils/files";

jest.mock("fs/promises");
jest.mock("@/utils/files", () => ({
  formatFileName: jest.fn((x: string) => x),
}));

class MockMediaWikiBuilder {
  build = jest.fn(() => "page content");
}

describe("writePageToFile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("writes page to id and named files in correct directories", async () => {
    const builder = new MockMediaWikiBuilder();
    const type = "npc";
    const name = "Goblin";
    const id = "123";

    await writePageToFile(builder as any, type, name, id);

    expect(mkdir).toHaveBeenCalledWith("./out/pages/npc", { recursive: true });
    expect(mkdir).toHaveBeenCalledWith("./out/pages/npc/named", {
      recursive: true,
    });

    expect(writeFile).toHaveBeenCalledWith(
      "./out/pages/npc/123.txt",
      "page content"
    );
    expect(formatFileName).toHaveBeenCalledWith(
      "./out/pages/npc/named/Goblin-123.txt"
    );
    expect(writeFile).toHaveBeenCalledWith(
      "./out/pages/npc/named/Goblin-123.txt",
      "page content"
    );
  });

  it("calls builder.build() for both files", async () => {
    const builder = new MockMediaWikiBuilder();
    await writePageToFile(builder as any, "item", "Sword", "456");
    expect(builder.build).toHaveBeenCalledTimes(2);
  });
});
