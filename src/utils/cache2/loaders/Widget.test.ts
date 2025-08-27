import { ClientScript1Instruction, ClientScript1Opcode } from "./ClientScript";
import { Widget } from "./Widget";
import { Reader } from "../Reader";
import { GameValType, WidgetID } from "../types";

describe("Widget", () => {
  describe("ClientScript1Instruction", () => {
    test("should parse instructions correctly", () => {
      const bytecode = [
        ClientScript1Opcode.VARP,
        123,
        ClientScript1Opcode.CONSTANT,
        456,
        ClientScript1Opcode.RETURN,
      ];
      const instructions = ClientScript1Instruction.parseInstructions(bytecode);

      expect(instructions).toHaveLength(3);
      expect(instructions[0].opcode).toBe(ClientScript1Opcode.VARP);
      expect(instructions[0].operands).toEqual([123]);
      expect(instructions[1].opcode).toBe(ClientScript1Opcode.CONSTANT);
      expect(instructions[1].operands).toEqual([456]);
      expect(instructions[2].opcode).toBe(ClientScript1Opcode.RETURN);
      expect(instructions[2].operands).toEqual([]);
    });

    test("should get correct argument counts", () => {
      expect(
        ClientScript1Instruction.getArgumentCount(ClientScript1Opcode.RETURN)
      ).toBe(0);
      expect(
        ClientScript1Instruction.getArgumentCount(ClientScript1Opcode.VARP)
      ).toBe(1);
      expect(
        ClientScript1Instruction.getArgumentCount(
          ClientScript1Opcode.WIDGET_CONTAINS_ITEM_GET_QUANTITY
        )
      ).toBe(3);
      expect(
        ClientScript1Instruction.getArgumentCount(
          ClientScript1Opcode.VARP_TESTBIT
        )
      ).toBe(2);
    });

    test("should handle empty bytecode", () => {
      const instructions = ClientScript1Instruction.parseInstructions([]);
      expect(instructions).toHaveLength(0);
    });
  });

  describe("Widget construction", () => {
    test("should create widget with correct defaults", () => {
      const widget = new Widget(<WidgetID>0x10000);

      expect(widget.id).toBe(0x10000);
      expect(widget.isIf3).toBe(false);
      expect(widget.type).toBe(0);
      expect(widget.parentId).toBe(-1);
      expect(widget.spriteId).toBe(-1);
      expect(widget.modelId).toBe(-1);
      expect(widget.animation).toBe(-1);
      expect(widget.fontId).toBe(-1);
      expect(widget.text).toBe("");
      expect(widget.tooltip).toBe("Ok");
    });
  });

  describe("Widget static properties", () => {
    test("should have correct GameVal type", () => {
      expect(Widget.gameval).toBe(GameValType.Widget);
      expect(Widget.index).toBe(3);
      expect(Widget.archive).toBe(-1);
    });

    test("should have gameVal property", () => {
      const widget = new Widget(123 as WidgetID);
      expect(widget.gameVal).toBeUndefined(); // Should be undefined by default

      // Can be assigned
      widget.gameVal = "test-value";
      expect(widget.gameVal).toBe("test-value");
    });
  });

  describe("Widget decoding", () => {
    test("should identify IF1 vs IF3 format", () => {
      // Test IF1 format (first byte is not 0xFF)
      const if1Data = new Uint8Array([
        0,
        0, // type, menuType
        0,
        0, // contentType
        0,
        0,
        0,
        0, // x, y
        0,
        10,
        0,
        10, // width, height
        255, // opacity
        0xff,
        0xff, // parentId (-1)
        0xff,
        0xff, // hoveredSiblingId (-1)
        0, // alternateCount
        0, // scriptCount
        0,
        0, // scrollHeight (for type 0)
        0, // isHidden
      ]);

      const if1Reader = new Reader(if1Data.buffer);
      const if1Widget = Widget.decode(if1Reader, <WidgetID>0x10000);
      expect(if1Widget.isIf3).toBe(false);

      // Test IF3 format (first byte is 0xFF)
      const if3Data = new Uint8Array([
        0xff, // IF3 marker
        0, // type
        0,
        0, // contentType
        0,
        0,
        0,
        0, // x, y
        0,
        10,
        0,
        10, // width, height
        0,
        0,
        0,
        0, // positioning modes
        0xff,
        0xff, // parentId
        0, // isHidden
        0,
        0,
        0,
        0, // scrollWidth, scrollHeight (for type 0)
        0, // noClickThrough
        0,
        0,
        0, // clickMask
        0, // name (empty)
        0, // actionCount
        0,
        0,
        0, // drag properties
        0, // targetVerb (empty)
        // Skip listeners and triggers for simplicity
        ...new Array(21).fill(0), // 18 listeners + 3 triggers, all empty
      ]);

      const if3Reader = new Reader(if3Data.buffer);
      const if3Widget = Widget.decode(if3Reader, <WidgetID>0x20000);
      expect(if3Widget.isIf3).toBe(true);
    });

    test("should handle basic properties", () => {
      const data = new Uint8Array([
        0,
        0, // type, menuType
        0,
        5, // contentType
        0,
        10,
        0,
        20, // x, y
        0,
        100,
        0,
        50, // width, height
        128, // opacity
        0xff,
        0xff, // parentId (-1)
        0xff,
        0xff, // hoveredSiblingId (-1)
        0, // alternateCount
        0, // scriptCount
        0,
        200, // scrollHeight (for type 0)
        0, // isHidden
      ]);

      const reader = new Reader(data.buffer);
      const widget = Widget.decode(reader, <WidgetID>0x30000);

      expect(widget.type).toBe(0);
      expect(widget.contentType).toBe(5);
      expect(widget.originalX).toBe(10);
      expect(widget.originalY).toBe(20);
      expect(widget.originalWidth).toBe(100);
      expect(widget.originalHeight).toBe(50);
      expect(widget.opacity).toBe(128);
      expect(widget.parentId).toBe(-1);
      expect(widget.hoveredSiblingId).toBe(-1);
      expect(widget.scrollHeight).toBe(200);
    });
  });

  describe("Archive loading methods", () => {
    test("loadWidgetsFromArchive should handle empty archive", () => {
      const mockArchiveData = {
        archive: 10,
        getFiles: (): Map<number, { data: Uint8Array }> => new Map(),
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const widgets = Widget.loadWidgetsFromArchive(mockArchiveData as any);

      expect(widgets).toHaveLength(0);
    });

    test("loadWidgetFromArchiveById should return undefined for non-existent file", () => {
      const mockArchiveData = {
        archive: 5,
        getFile: (): undefined => undefined,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const widget = Widget.loadWidgetFromArchiveById(
        mockArchiveData as any,
        999
      );
      expect(widget).toBeUndefined();
    });

    test("loadWidgetsFromArchive and loadWidgetFromArchiveById should set correct widget IDs", () => {
      // Test the ID generation logic by mocking Widget.decode to avoid complex binary parsing
      const originalDecode = Widget.decode;

      // Mock the decode method to return a new simple widget with the provided ID
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Widget.decode = jest
        .fn()
        .mockImplementation((r: Reader, id: WidgetID) => {
          const mockWidget = new Widget(id);
          mockWidget.type = 0;
          return mockWidget;
        });

      try {
        const mockArchiveData = {
          archive: 42,
          getFiles: (): Map<number, { data: Uint8Array }> =>
            new Map([
              [5, { data: new Uint8Array([1, 2, 3]) }],
              [10, { data: new Uint8Array([4, 5, 6]) }],
            ]),
          getFile: (fileId: number): { data: Uint8Array } | undefined => {
            if (fileId === 7) {
              return { data: new Uint8Array([7, 8, 9]) };
            }
            return undefined;
          },
        };

        // Test loadWidgetsFromArchive
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widgets = Widget.loadWidgetsFromArchive(mockArchiveData as any);
        expect(widgets).toHaveLength(2);
        expect(widgets[0].id).toBe((42 << 16) + 5); // archiveId << 16 + fileId
        expect(widgets[1].id).toBe((42 << 16) + 10);

        // Test loadWidgetFromArchiveById
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const widget = Widget.loadWidgetFromArchiveById(
          mockArchiveData as any,
          7
        );
        expect(widget).not.toBeUndefined();
        if (widget) {
          expect(widget.id).toBe((42 << 16) + 7);
        }

        // Verify decode was called with correct parameters
        expect(Widget.decode).toHaveBeenCalledTimes(3);
      } finally {
        // Restore original decode method
        Widget.decode = originalDecode;
      }
    });
  });
});
