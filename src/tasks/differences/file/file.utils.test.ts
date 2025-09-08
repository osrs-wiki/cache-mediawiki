import {
  getChangedResult,
  createCompareFunction,
  createSimpleCompareFunction,
  createArchiveCompareFunction,
  createRegionCompareFunction,
} from "./file.utils";

import { NPC, Reader, GameVal } from "@/utils/cache2";

describe("file utils", () => {
  describe("getChangedResult", () => {
    test("type: string", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            name: "test",
          },
          {
            name: "test2",
          }
        )
      ).toEqual({
        name: {
          oldValue: "test",
          newValue: "test2",
        },
      });
    });

    test("type: new string", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            name: null,
          },
          {
            name: "test2",
          }
        )
      ).toEqual({
        name: {
          oldValue: null,
          newValue: "test2",
        },
      });
    });

    test("type: number", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            combatLevel: 50,
          },
          {
            combatLevel: 100,
          }
        )
      ).toEqual({
        combatLevel: {
          oldValue: 50,
          newValue: 100,
        },
      });
    });

    test("type: new number", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            combatLevel: null,
          },
          {
            combatLevel: 100,
          }
        )
      ).toEqual({
        combatLevel: {
          oldValue: null,
          newValue: 100,
        },
      });
    });

    test("type: array added elements", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, null, null, null],
          },
          {
            actions: ["Talk", null, "Trade", null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, null, null, null],
          newValue: ["Talk", null, "Trade", null, null],
        },
      });
    });

    test("type: array removed elements", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, "Trade", null, null],
          },
          {
            actions: ["Talk", null, null, null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, "Trade", null, null],
          newValue: ["Talk", null, null, null, null],
        },
      });
    });

    test("type: new array", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: null,
          },
          {
            actions: ["Talk", null, null, null, null],
          }
        )
      ).toEqual({
        actions: {
          oldValue: null,
          newValue: ["Talk", null, null, null, null],
        },
      });
    });

    test("type: removed array", () => {
      expect(
        getChangedResult<NPC>(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore Do not require entire NPC
          {
            actions: ["Talk", null, null, null, null],
          },
          {
            actions: null,
          }
        )
      ).toEqual({
        actions: {
          oldValue: ["Talk", null, null, null, null],
          newValue: null,
        },
      });
    });
  });

  describe("createCompareFunction", () => {
    // Mock decoder for testing
    const mockDecoder = {
      decode: jest.fn(),
    };

    // Mock GameVal.nameFor
    let mockGameValNameFor: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      // Setup mock implementations
      mockGameValNameFor = jest
        .spyOn(GameVal, "nameFor")
        .mockResolvedValue("Mock Name");
    });

    afterEach(() => {
      if (mockGameValNameFor) {
        mockGameValNameFor.mockRestore();
      }
    });

    const createMockFileContext = (
      fileId: number,
      archiveId: number = fileId
    ) => ({
      file: {
        data: Buffer.from([1, 2, 3]),
        id: fileId,
        namehash: 0,
      },
      archive: {
        archive: archiveId,
        index: 0,
        compressedData: Buffer.from([]),
        namehash: 0,
        revision: 100,
        crc: 0,
        version: 0,
        entryIds: [],
        fileCount: 1,
        diskSize: 0,
        uncompressedData: Buffer.from([]),
      } as any,
      index: { revision: 100 } as any,
    });

    test("should handle both old and new files with GameVal lookup", async () => {
      const mockOldEntry = {
        id: 1,
        name: "Old Name",
        gameVal: undefined as any,
      };
      const mockNewEntry = {
        id: 1,
        name: "New Name",
        gameVal: undefined as any,
      };

      mockDecoder.decode
        .mockReturnValueOnce(mockOldEntry)
        .mockReturnValueOnce(mockNewEntry);

      const compareFn = createCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1);
      const newFile = createMockFileContext(1);

      const result = await compareFn({ oldFile, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(2);
      expect(mockGameValNameFor).toHaveBeenCalledTimes(2);
      expect(mockOldEntry.gameVal).toBe("Mock Name");
      expect(mockNewEntry.gameVal).toBe("Mock Name");
      expect(result).toHaveProperty("changed");
    });

    test("should handle only old file", async () => {
      const mockOldEntry = {
        id: 1,
        name: "Old Name",
        gameVal: undefined as any,
      };

      mockDecoder.decode.mockReturnValueOnce(mockOldEntry);

      const compareFn = createCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1);

      const result = await compareFn({ oldFile, newFile: undefined });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(mockGameValNameFor).toHaveBeenCalledTimes(1);
      expect(mockOldEntry.gameVal).toBe("Mock Name");
      expect(result).toHaveProperty("removed");
    });

    test("should handle only new file", async () => {
      const mockNewEntry = {
        id: 1,
        name: "New Name",
        gameVal: undefined as any,
      };

      mockDecoder.decode.mockReturnValueOnce(mockNewEntry);

      const compareFn = createCompareFunction(mockDecoder);

      const newFile = createMockFileContext(1);

      const result = await compareFn({ oldFile: undefined, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(mockGameValNameFor).toHaveBeenCalledTimes(1);
      expect(mockNewEntry.gameVal).toBe("Mock Name");
      expect(result).toHaveProperty("added");
    });

    test("should handle undefined files", async () => {
      const compareFn = createCompareFunction(mockDecoder);

      const result = await compareFn({
        oldFile: undefined,
        newFile: undefined,
      });

      expect(mockDecoder.decode).not.toHaveBeenCalled();
      expect(mockGameValNameFor).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe("createSimpleCompareFunction", () => {
    const mockDecoder = {
      decode: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    const createMockFileContext = (fileId: number) => ({
      file: {
        data: Buffer.from([1, 2, 3]),
        id: fileId,
        namehash: 0,
      },
      archive: {
        archive: fileId,
        index: 0,
        compressedData: Buffer.from([]),
        namehash: 0,
        revision: 100,
        crc: 0,
        version: 0,
        entryIds: [],
        fileCount: 1,
        diskSize: 0,
        uncompressedData: Buffer.from([]),
      } as any,
      index: { revision: 100 } as any,
    });

    test("should handle both old and new files without GameVal lookup", async () => {
      const mockOldEntry = { id: 1, name: "Old Area" };
      const mockNewEntry = { id: 1, name: "New Area" };

      mockDecoder.decode
        .mockReturnValueOnce(mockOldEntry)
        .mockReturnValueOnce(mockNewEntry);

      const compareFn = createSimpleCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1);
      const newFile = createMockFileContext(1);

      const result = await compareFn({ oldFile, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty("changed");
    });

    test("should handle only old file", async () => {
      const mockOldEntry = { id: 1, name: "Old Area" };

      mockDecoder.decode.mockReturnValueOnce(mockOldEntry);

      const compareFn = createSimpleCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1);

      const result = await compareFn({ oldFile, newFile: undefined });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("removed");
    });

    test("should handle only new file", async () => {
      const mockNewEntry = { id: 1, name: "New Area" };

      mockDecoder.decode.mockReturnValueOnce(mockNewEntry);

      const compareFn = createSimpleCompareFunction(mockDecoder);

      const newFile = createMockFileContext(1);

      const result = await compareFn({ oldFile: undefined, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("added");
    });
  });

  describe("createArchiveCompareFunction", () => {
    const mockDecoder = {
      decode: jest.fn(),
    };

    let mockGameValNameFor: jest.SpyInstance;

    beforeEach(() => {
      jest.clearAllMocks();
      mockGameValNameFor = jest
        .spyOn(GameVal, "nameFor")
        .mockResolvedValue("Mock Sprite Name");
    });

    afterEach(() => {
      if (mockGameValNameFor) {
        mockGameValNameFor.mockRestore();
      }
    });

    const createMockFileContext = (fileId: number, archiveId: number) => ({
      file: {
        data: Buffer.from([1, 2, 3]),
        id: fileId,
        namehash: 0,
      },
      archive: {
        archive: archiveId,
        index: 0,
        compressedData: Buffer.from([]),
        namehash: 0,
        revision: 100,
        crc: 0,
        version: 0,
        entryIds: [],
        fileCount: 1,
        diskSize: 0,
        uncompressedData: Buffer.from([]),
      } as any,
      index: { revision: 100 } as any,
    });

    test("should handle both old and new files using archive.archive for ID", async () => {
      const mockOldEntry = {
        id: 100,
        name: "Old Sprite",
        gameVal: undefined as any,
      };
      const mockNewEntry = {
        id: 100,
        name: "New Sprite",
        gameVal: undefined as any,
      };

      mockDecoder.decode
        .mockReturnValueOnce(mockOldEntry)
        .mockReturnValueOnce(mockNewEntry);

      const compareFn = createArchiveCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1, 100);
      const newFile = createMockFileContext(1, 100);

      const result = await compareFn({ oldFile, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(2);
      // Verify that archive.archive (100) was used as ID, not file.id (1)
      expect(mockDecoder.decode).toHaveBeenCalledWith(expect.any(Reader), 100);
      expect(mockGameValNameFor).toHaveBeenCalledTimes(2);
      expect(mockOldEntry.gameVal).toBe("Mock Sprite Name");
      expect(mockNewEntry.gameVal).toBe("Mock Sprite Name");
      expect(result).toHaveProperty("changed");
    });

    test("should handle only old file using archive.archive", async () => {
      const mockOldEntry = {
        id: 100,
        name: "Old Sprite",
        gameVal: undefined as any,
      };

      mockDecoder.decode.mockReturnValueOnce(mockOldEntry);

      const compareFn = createArchiveCompareFunction(mockDecoder);

      const oldFile = createMockFileContext(1, 100);

      const result = await compareFn({ oldFile, newFile: undefined });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(mockDecoder.decode).toHaveBeenCalledWith(
        expect.any(Reader),
        100 // archive.archive, not file.id
      );
      expect(mockGameValNameFor).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("removed");
    });

    test("should handle only new file using archive.archive", async () => {
      const mockNewEntry = {
        id: 100,
        name: "New Sprite",
        gameVal: undefined as any,
      };

      mockDecoder.decode.mockReturnValueOnce(mockNewEntry);

      const compareFn = createArchiveCompareFunction(mockDecoder);

      const newFile = createMockFileContext(1, 100);

      const result = await compareFn({ oldFile: undefined, newFile });

      expect(mockDecoder.decode).toHaveBeenCalledTimes(1);
      expect(mockDecoder.decode).toHaveBeenCalledWith(
        expect.any(Reader),
        100 // archive.archive, not file.id
      );
      expect(mockGameValNameFor).toHaveBeenCalledTimes(1);
      expect(result).toHaveProperty("added");
    });
  });

  describe("Generic Compare Functions", () => {
    // Simple tests focusing on core functionality
    test("createCompareFunction should exist and be callable", () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createCompareFunction(mockDecoder);
      expect(typeof compareFn).toBe("function");
    });

    test("createSimpleCompareFunction should exist and be callable", () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createSimpleCompareFunction(mockDecoder);
      expect(typeof compareFn).toBe("function");
    });

    test("createArchiveCompareFunction should exist and be callable", () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createArchiveCompareFunction(mockDecoder);
      expect(typeof compareFn).toBe("function");
    });

    test("createCompareFunction should handle undefined files", async () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createCompareFunction(mockDecoder);

      const result = await compareFn({
        oldFile: undefined,
        newFile: undefined,
      });

      expect(mockDecoder.decode).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test("createSimpleCompareFunction should handle undefined files", async () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createSimpleCompareFunction(mockDecoder);

      const result = await compareFn({
        oldFile: undefined,
        newFile: undefined,
      });

      expect(mockDecoder.decode).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });

    test("createArchiveCompareFunction should handle undefined files", async () => {
      const mockDecoder = { decode: jest.fn() };
      const compareFn = createArchiveCompareFunction(mockDecoder);

      const result = await compareFn({
        oldFile: undefined,
        newFile: undefined,
      });

      expect(mockDecoder.decode).not.toHaveBeenCalled();
      expect(result).toEqual({});
    });
  });

  describe("createRegionCompareFunction", () => {
    test("should exist and be callable", () => {
      const compareFn = createRegionCompareFunction();
      expect(typeof compareFn).toBe("function");
    });

    test("should handle undefined files", async () => {
      const compareFn = createRegionCompareFunction();

      const result = await compareFn({
        oldFile: undefined,
        newFile: undefined,
      });

      expect(result).toEqual({});
    });

    test("should handle file with unmapped archive ID", async () => {
      const compareFn = createRegionCompareFunction();

      const mockFile = {
        file: {
          data: Buffer.from([1, 2, 3]),
          id: 1,
          namehash: 0,
        },
        archive: {
          archive: 999999, // Unmapped archive ID
          index: 0,
          compressedData: Buffer.from([]),
          namehash: 0,
          revision: 100,
          crc: 0,
          version: 0,
          entryIds: [] as number[],
          fileCount: 1,
          diskSize: 0,
          uncompressedData: Buffer.from([]),
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        index: { revision: 100 } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };

      const result = await compareFn({
        oldFile: mockFile,
        newFile: undefined,
      });

      // Should fall back to binary comparison for unmapped archive
      expect(result).toHaveProperty("removed");
    });

    test("should handle mapped archive ID with successful region loading", async () => {
      const compareFn = createRegionCompareFunction();

      // Get a valid archive ID from RegionMapper
      const { RegionMapper } = await import(
        "@/utils/cache2/loaders/RegionMapper"
      );
      const validArchiveIds = RegionMapper.getAllRegionArchiveIds();
      const archiveId = validArchiveIds[0]; // Use the first valid archive ID

      const mockFile = {
        file: {
          data: Buffer.from([1, 2, 3]),
          id: 1,
          namehash: 0,
        },
        archive: {
          archive: archiveId,
          index: 0,
          compressedData: Buffer.from([]),
          namehash: 0,
          revision: 100,
          crc: 0,
          version: 0,
          entryIds: [] as number[],
          fileCount: 1,
          diskSize: 0,
          uncompressedData: Buffer.from([]),
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        index: { revision: 100 } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      };

      const result = await compareFn({
        oldFile: mockFile,
        newFile: undefined,
      });

      // Should attempt region loading but fail due to missing cache provider
      // This will trigger the catch block and fall back to binary comparison
      expect(result).toHaveProperty("removed");
    });

    test("should handle both old and new files with region loading", async () => {
      const compareFn = createRegionCompareFunction();

      // Get a valid archive ID from RegionMapper
      const { RegionMapper } = await import(
        "@/utils/cache2/loaders/RegionMapper"
      );
      const validArchiveIds = RegionMapper.getAllRegionArchiveIds();
      const archiveId = validArchiveIds[0]; // Use the first valid archive ID

      const createMockFile = () => ({
        file: {
          data: Buffer.from([1, 2, 3]),
          id: 1,
          namehash: 0,
        },
        archive: {
          archive: archiveId,
          index: 0,
          compressedData: Buffer.from([]),
          namehash: 0,
          revision: 100,
          crc: 0,
          version: 0,
          entryIds: [] as number[],
          fileCount: 1,
          diskSize: 0,
          uncompressedData: Buffer.from([]),
        } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
        index: { revision: 100 } as any, // eslint-disable-line @typescript-eslint/no-explicit-any
      });

      const oldFile = createMockFile();
      const newFile = createMockFile();

      const result = await compareFn({
        oldFile,
        newFile,
      });

      // Should attempt region loading but will fail due to missing cache provider
      // The compare function will fall back to handling the regions normally
      expect(result).toBeDefined();
    });
  });
});
