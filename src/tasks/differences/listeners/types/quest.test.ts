import { questListener } from "./quest";
import { FileContext } from "../../differences.types";

import Context from "@/context";
import { writeQuestPage } from "@/tasks/pages/types";

jest.mock("@/tasks/pages/types", () => ({
  ...jest.requireActual("@/tasks/pages/types"),
  writeQuestPage: jest.fn(),
}));

const writeQuestPageMock = writeQuestPage as jest.MockedFunction<
  typeof writeQuestPage
>;

const createFileContext = (id: number, table: number): FileContext =>
  ({
    index: { id: 2, revision: 242 },
    archive: { archive: 38 },
    file: {
      id,
      data: new Uint8Array([4, table, 0]),
    },
  } as FileContext);

describe("questListener", () => {
  beforeEach(() => {
    Context.pages = true;
    Context.newCacheProvider = {} as typeof Context.newCacheProvider;
    writeQuestPageMock.mockResolvedValue(undefined);
    writeQuestPageMock.mockClear();
  });

  afterEach(() => {
    Context.pages = undefined;
    Context.newCacheProvider = undefined;
  });

  it("writes new quest rows from DBTable 0", async () => {
    const newFile = createFileContext(13730, 0);

    await questListener.handler({ newFile });

    expect(writeQuestPageMock).toHaveBeenCalledTimes(1);
    expect(writeQuestPageMock).toHaveBeenCalledWith(
      expect.any(Promise),
      expect.objectContaining({
        id: 13730,
        table: 0,
      })
    );
  });

  it("ignores rows from other DBTables", async () => {
    await questListener.handler({ newFile: createFileContext(13704, 44) });

    expect(writeQuestPageMock).not.toHaveBeenCalled();
  });

  it("ignores modified existing quest rows", async () => {
    await questListener.handler({
      oldFile: createFileContext(13730, 0),
      newFile: createFileContext(13730, 0),
    });

    expect(writeQuestPageMock).not.toHaveBeenCalled();
  });

  it("does not write pages when Context.pages is disabled", async () => {
    Context.pages = false;

    await questListener.handler({ newFile: createFileContext(13730, 0) });

    expect(writeQuestPageMock).not.toHaveBeenCalled();
  });
});
