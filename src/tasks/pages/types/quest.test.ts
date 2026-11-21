import { writeQuestPageFromCache } from "./quest";

import { dbRowToQuest, questPageBuilder } from "@/mediawiki/pages/quest";
import { writePageToFile } from "@/tasks/pages/pages.utils";
import { CacheProvider, DBRow } from "@/utils/cache2";

jest.mock("@/mediawiki/pages/quest", () => ({
  ...jest.requireActual("@/mediawiki/pages/quest"),
  dbRowToQuest: jest.fn(),
  questPageBuilder: jest.fn(),
}));
jest.mock("@/tasks/pages/pages.utils", () => ({
  writePageToFile: jest.fn(),
}));

const dbRowLoad = jest.spyOn(DBRow, "load") as jest.Mock;
const dbRowToQuestMock = dbRowToQuest as jest.MockedFunction<
  typeof dbRowToQuest
>;
const questPageBuilderMock = questPageBuilder as jest.MockedFunction<
  typeof questPageBuilder
>;
const writePageToFileMock = writePageToFile as jest.MockedFunction<
  typeof writePageToFile
>;
const cache = Promise.resolve({} as CacheProvider);

describe("writeQuestPageFromCache", () => {
  const warn = jest.spyOn(console, "warn").mockImplementation();
  const error = jest.spyOn(console, "error").mockImplementation();

  beforeEach(() => {
    warn.mockClear();
    error.mockClear();
    dbRowLoad.mockReset();
    dbRowToQuestMock.mockReset();
    questPageBuilderMock.mockReset();
    writePageToFileMock.mockReset();
  });

  afterAll(() => {
    warn.mockRestore();
    error.mockRestore();
    dbRowLoad.mockRestore();
  });

  it("reports a missing quest DBRow without rejecting", async () => {
    dbRowLoad.mockResolvedValue(undefined);

    await expect(writeQuestPageFromCache(cache, 123)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith("Quest DBRow 123 was not found.");
    expect(error).not.toHaveBeenCalled();
  });

  it("reports a DBRow from a non-quest table without rejecting", async () => {
    dbRowLoad.mockResolvedValue({ id: 123, table: 44 } as DBRow);

    await expect(writeQuestPageFromCache(cache, 123)).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledWith(
      "DBRow 123 belongs to table 44, not the quest table."
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("reports metadata failures without rejecting", async () => {
    const failure = new Error("metadata unavailable");
    dbRowLoad.mockResolvedValue({ id: 123, table: 0 } as DBRow);
    dbRowToQuestMock.mockRejectedValue(failure);

    await expect(writeQuestPageFromCache(cache, 123)).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith(
      "Error generating page for quest 123: ",
      failure
    );
  });

  it("reports file-writing failures without rejecting", async () => {
    const failure = new Error("output unavailable");
    dbRowLoad.mockResolvedValue({ id: 123, table: 0 } as DBRow);
    dbRowToQuestMock.mockResolvedValue({
      name: "Test Quest",
    } as Awaited<ReturnType<typeof dbRowToQuest>>);
    questPageBuilderMock.mockReturnValue(
      {} as ReturnType<typeof questPageBuilder>
    );
    writePageToFileMock.mockRejectedValue(failure);

    await expect(writeQuestPageFromCache(cache, 123)).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith(
      "Error generating page for quest 123: ",
      failure
    );
  });
});
