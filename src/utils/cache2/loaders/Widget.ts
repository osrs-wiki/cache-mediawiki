import { ClientScript1Instruction } from "./ClientScript";
import { ArchiveData, CacheProvider } from "../Cache";
import { PerArchiveParentLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import {
  AnimationID,
  FontID,
  GameValType,
  IndexType,
  ModelID,
  SpriteID,
  TextureID,
  WidgetID,
} from "../types";

@Typed
export class Widget extends PerArchiveParentLoadable {
  constructor(public id: WidgetID) {
    super();
  }

  public static readonly index = IndexType.Interfaces;
  public static readonly gameval = GameValType.Widget;

  public archiveId?: number;

  // Core properties
  public isIf3 = false;
  public type = 0;
  public contentType = 0;
  public originalX = 0;
  public originalY = 0;
  public originalWidth = 0;
  public originalHeight = 0;
  public widthMode = 0;
  public heightMode = 0;
  public xPositionMode = 0;
  public yPositionMode = 0;
  public parentId = <WidgetID>-1;
  public isHidden = false;
  public scrollWidth = 0;
  public scrollHeight = 0;
  public noClickThrough = false;

  // Visual properties
  public spriteId = <SpriteID>-1;
  public textureId = <TextureID>0;
  public spriteTiling = false;
  public opacity = 0;
  public borderType = 0;
  public shadowColor = 0;
  public flippedVertically = false;
  public flippedHorizontally = false;

  // Model properties
  public modelType = 1;
  public modelId = <ModelID>-1;
  public offsetX2d = 0;
  public offsetY2d = 0;
  public rotationX = 0;
  public rotationY = 0;
  public rotationZ = 0;
  public modelZoom = 100;
  public animation = <AnimationID>-1;
  public orthogonal = false;
  public modelHeightOverride = 0;

  // Text properties
  public fontId = <FontID>-1;
  public text = "";
  public lineHeight = 0;
  public xTextAlignment = 0;
  public yTextAlignment = 0;
  public textShadowed = false;
  public textColor = 0;

  // Drawing properties
  public filled = false;
  public lineWidth = 1;
  public lineDirection = false;

  // Interaction properties
  public clickMask = 0;
  public name = "";
  public actions: (string | null)[] = [];
  public dragDeadZone = 0;
  public dragDeadTime = 0;
  public dragRenderBehavior = false;
  public targetVerb = "";

  // Event listeners
  public onLoadListener: (string | number)[] | null = null;
  public onMouseOverListener: (string | number)[] | null = null;
  public onMouseLeaveListener: (string | number)[] | null = null;
  public onTargetLeaveListener: (string | number)[] | null = null;
  public onTargetEnterListener: (string | number)[] | null = null;
  public onVarTransmitListener: (string | number)[] | null = null;
  public onInvTransmitListener: (string | number)[] | null = null;
  public onStatTransmitListener: (string | number)[] | null = null;
  public onTimerListener: (string | number)[] | null = null;
  public onOpListener: (string | number)[] | null = null;
  public onMouseRepeatListener: (string | number)[] | null = null;
  public onClickListener: (string | number)[] | null = null;
  public onClickRepeatListener: (string | number)[] | null = null;
  public onReleaseListener: (string | number)[] | null = null;
  public onHoldListener: (string | number)[] | null = null;
  public onDragListener: (string | number)[] | null = null;
  public onDragCompleteListener: (string | number)[] | null = null;
  public onScrollWheelListener: (string | number)[] | null = null;

  // Triggers
  public varTransmitTriggers: number[] | null = null;
  public invTransmitTriggers: number[] | null = null;
  public statTransmitTriggers: number[] | null = null;
  public hasListener = false;

  // IF1 specific properties
  public menuType = 0;
  public hoveredSiblingId = <WidgetID>-1;
  public alternateOperators: number[] | null = null;
  public alternateRhs: number[] | null = null;
  public clientScripts: ClientScript1Instruction[][] | null = null;
  public itemIds: number[] | null = null;
  public itemQuantities: number[] | null = null;
  public xPitch = 0;
  public yPitch = 0;
  public xOffsets: number[] | null = null;
  public yOffsets: number[] | null = null;
  public sprites: number[] | null = null;
  public configActions: (string | null)[] | null = null;
  public alternateText = "";
  public alternateTextColor = 0;
  public hoveredTextColor = 0;
  public alternateHoveredTextColor = 0;
  public alternateSpriteId = <SpriteID>-1;
  public alternateModelId = <ModelID>-1;
  public alternateAnimation = <AnimationID>-1;
  public spellName = "";
  public tooltip = "Ok";
  public gameVal?: string;

  public static decode(r: Reader, id: WidgetID): Widget {
    const widget = new Widget(id);

    widget.archiveId = (id as number) >>> 16;

    // Check if first byte is 0xFF to determine IF3 vs IF1
    const firstByte = r.dataView.getUint8(r.offset);
    if (firstByte === 255) {
      // 0xFF indicates IF3
      widget.decodeIf3(r);
    } else {
      widget.decodeIf1(r);
    }

    return widget;
  }

  /**
   * Load all widgets from an archive data object
   */
  public static loadWidgetsFromArchive(archiveData: ArchiveData): Widget[] {
    // Get all files from the archive
    const files = archiveData.getFiles();
    const widgets: Widget[] = [];

    for (const [fileId, archiveFile] of files) {
      // Calculate the widget ID: (archiveId << 16) + fileId
      const widgetId = ((archiveData.archive << 16) + fileId) as WidgetID;

      // Create a reader from the file data
      const reader = new Reader(archiveFile.data);

      // Decode the widget
      const widget = Widget.decode(reader, widgetId);
      widgets.push(widget);
    }

    return widgets;
  }

  /**
   * Load a specific widget by file ID from an archive data object
   */
  public static loadWidgetFromArchiveById(
    archiveData: ArchiveData,
    fileId: number
  ): Widget | undefined {
    const archiveFile = archiveData.getFile(fileId);
    if (!archiveFile) {
      return undefined;
    }

    // Calculate the widget ID: (archiveId << 16) + fileId
    const widgetId = ((archiveData.archive << 16) + fileId) as WidgetID;

    // Create a reader from the file data
    const reader = new Reader(archiveFile.data);

    // Decode the widget
    return Widget.decode(reader, widgetId);
  }

  /**
   * Generate widget ID from archive ID and file ID
   * Widget IDs are composed as: (archiveId << 16) + fileId
   */
  public static getId(archiveId: number, fileId: number): WidgetID {
    return ((archiveId << 16) + fileId) as WidgetID;
  }

  /**
   * Load a widget archive as parent with children using the new parent-child structure
   */
  public static async loadWidgetArchive(
    cache: CacheProvider,
    archiveId: number
  ): Promise<Widget | undefined> {
    const result = await Widget.loadDataWithChildren(cache, archiveId);
    if (!result) return undefined;

    // Populate the parent's children array
    result.parent.children = result.children;
    return result.parent as Widget;
  }

  /**
   * Load all widget archives with parent-child relationships populated
   */
  public static async allWithChildren(
    cache: CacheProvider | Promise<CacheProvider>
  ): Promise<Widget[]> {
    const resolvedCache = await cache;
    const ids = await resolvedCache.getArchives(Widget.index);
    if (!ids) {
      return [];
    }

    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          return await Widget.loadWidgetArchive(resolvedCache, id);
        } catch (e) {
          if (typeof e === "object" && e && "message" in e) {
            const errorWithMessage = e as { message: string };
            errorWithMessage.message = id + ": " + errorWithMessage.message;
          }
          throw e;
        }
      })
    );

    return results.filter((result): result is Widget => result !== undefined);
  }

  /**
   * Get parent widget ID from any child widget ID
   */
  public static getParentId(widgetId: WidgetID): WidgetID {
    return (widgetId & ~0xffff) as WidgetID;
  }

  /**
   * Check if this widget is a parent widget (file ID 0)
   */
  public isParent(): boolean {
    return (this.id & 0xffff) === 0;
  }

  /**
   * Get all child widgets of this widget
   */
  public getChildren(): Widget[] {
    return (this.children as Widget[]) || [];
  }

  /**
   * Add a child widget to this parent widget
   */
  public addChild(child: Widget): void {
    if (!this.children) {
      this.children = [];
    }
    (this.children as Widget[]).push(child);
  }

  private decodeIf1(r: Reader): void {
    // Implementation of IF1 decoding logic from InterfaceLoader.decodeIf1()
    this.isIf3 = false;
    this.type = r.u8();
    this.menuType = r.u8();
    this.contentType = r.u16();
    this.originalX = r.i16();
    this.originalY = r.i16();
    this.originalWidth = r.u16();
    this.originalHeight = r.u16();
    this.opacity = r.u8();

    this.parentId = <WidgetID>r.u16();
    if (this.parentId === 0xffff) {
      this.parentId = <WidgetID>-1;
    } else {
      this.parentId = <WidgetID>(this.parentId + (this.id & ~0xffff));
    }

    this.hoveredSiblingId = <WidgetID>r.u16();
    if (this.hoveredSiblingId === 0xffff) {
      this.hoveredSiblingId = <WidgetID>-1;
    }

    // Decode alternate operators
    const alternateCount = r.u8();
    if (alternateCount > 0) {
      this.alternateOperators = new Array(alternateCount);
      this.alternateRhs = new Array(alternateCount);
      for (let i = 0; i < alternateCount; i++) {
        this.alternateOperators[i] = r.u8();
        this.alternateRhs[i] = r.u16();
      }
    }

    // Decode client scripts
    const scriptCount = r.u8();
    if (scriptCount > 0) {
      this.clientScripts = new Array(scriptCount);
      for (let i = 0; i < scriptCount; i++) {
        const bytecodeLength = r.u16();
        const bytecode = new Array(bytecodeLength);
        for (let j = 0; j < bytecodeLength; j++) {
          bytecode[j] = r.u16();
          if (bytecode[j] === 0xffff) {
            bytecode[j] = -1;
          }
        }
        this.clientScripts[i] =
          ClientScript1Instruction.parseInstructions(bytecode);
      }
    }

    // Type-specific decoding
    this.decodeIf1TypeSpecific(r);
  }

  private decodeIf1TypeSpecific(r: Reader): void {
    switch (this.type) {
      case 0: // Container
        this.scrollHeight = r.u16();
        this.isHidden = r.u8() === 1;
        break;

      case 1: // Unknown/deprecated
        r.u16(); // Skip
        r.u8(); // Skip
        break;

      case 2: // Inventory
        this.decodeInventoryWidget(r);
        break;

      case 3: // Rectangle
        this.filled = r.u8() === 1;
        break;

      case 4: // Text
        this.decodeTextWidget(r);
        break;

      case 5: // Sprite
        this.spriteId = <SpriteID>r.i32();
        this.alternateSpriteId = <SpriteID>r.i32();
        break;

      case 6: // Model
        this.decodeModelWidget(r);
        break;

      case 7: // Item container
        this.decodeItemContainer(r);
        break;

      case 8: // Text
        this.text = r.string();
        break;
    }

    // Common post-processing
    this.decodeCommonIf1Properties(r);
  }

  private decodeInventoryWidget(r: Reader): void {
    this.itemIds = new Array(this.originalWidth * this.originalHeight);
    this.itemQuantities = new Array(this.originalHeight * this.originalWidth);

    const flag1 = r.u8();
    if (flag1 === 1) {
      this.clickMask |= 268435456;
    }

    const flag2 = r.u8();
    if (flag2 === 1) {
      this.clickMask |= 1073741824;
    }

    const flag3 = r.u8();
    if (flag3 === 1) {
      this.clickMask |= -2147483648; // Integer.MIN_VALUE
    }

    const flag4 = r.u8();
    if (flag4 === 1) {
      this.clickMask |= 536870912;
    }

    this.xPitch = r.u8();
    this.yPitch = r.u8();
    this.xOffsets = new Array(20);
    this.yOffsets = new Array(20);
    this.sprites = new Array(20);

    for (let i = 0; i < 20; i++) {
      const hasSprite = r.u8();
      if (hasSprite === 1) {
        this.xOffsets[i] = r.i16();
        this.yOffsets[i] = r.i16();
        this.sprites[i] = r.i32();
      } else {
        this.sprites[i] = -1;
      }
    }

    this.configActions = new Array(5);
    for (let i = 0; i < 5; i++) {
      const action = r.string();
      if (action.length > 0) {
        this.configActions[i] = action;
        this.clickMask |= 1 << (i + 23);
      }
    }
  }

  private decodeTextWidget(r: Reader): void {
    this.xTextAlignment = r.u8();
    this.yTextAlignment = r.u8();
    this.lineHeight = r.u8();
    this.fontId = <FontID>r.u16();
    if (this.fontId === 0xffff) {
      this.fontId = <FontID>-1;
    }

    this.textShadowed = r.u8() === 1;

    if (this.type === 4) {
      this.text = r.string();
      this.alternateText = r.string();
    }
  }

  private decodeModelWidget(r: Reader): void {
    this.modelType = 1;
    this.modelId = <ModelID>r.u16();
    if (this.modelId === 0xffff) {
      this.modelId = <ModelID>-1;
    }

    this.alternateModelId = <ModelID>r.u16();
    if (this.alternateModelId === 0xffff) {
      this.alternateModelId = <ModelID>-1;
    }

    this.animation = <AnimationID>r.u16();
    if (this.animation === 0xffff) {
      this.animation = <AnimationID>-1;
    }

    this.alternateAnimation = <AnimationID>r.u16();
    if (this.alternateAnimation === 0xffff) {
      this.alternateAnimation = <AnimationID>-1;
    }

    this.modelZoom = r.u16();
    this.rotationX = r.u16();
    this.rotationZ = r.u16();
  }

  private decodeItemContainer(r: Reader): void {
    this.itemIds = new Array(this.originalWidth * this.originalHeight);
    this.itemQuantities = new Array(this.originalWidth * this.originalHeight);
    this.xTextAlignment = r.u8();
    this.fontId = <FontID>r.u16();
    if (this.fontId === 0xffff) {
      this.fontId = <FontID>-1;
    }

    this.textShadowed = r.u8() === 1;
    this.textColor = r.i32();
    this.xPitch = r.i16();
    this.yPitch = r.i16();

    const flag = r.u8();
    if (flag === 1) {
      this.clickMask |= 1073741824;
    }

    this.configActions = new Array(5);
    for (let i = 0; i < 5; i++) {
      const action = r.string();
      if (action.length > 0) {
        this.configActions[i] = action;
        this.clickMask |= 1 << (i + 23);
      }
    }
  }

  private decodeCommonIf1Properties(r: Reader): void {
    // Decode common properties for text and rectangle types
    if (this.type === 1 || this.type === 3 || this.type === 4) {
      this.textColor = r.i32();
    }

    if (this.type === 3 || this.type === 4) {
      this.alternateTextColor = r.i32();
      this.hoveredTextColor = r.i32();
      this.alternateHoveredTextColor = r.i32();
    }

    // Handle menu types and tooltips
    if (this.menuType === 2 || this.type === 2) {
      this.targetVerb = r.string();
      this.spellName = r.string();
      const flags = r.u16() & 63;
      this.clickMask |= flags << 11;
    }

    if (
      this.menuType === 1 ||
      this.menuType === 4 ||
      this.menuType === 5 ||
      this.menuType === 6
    ) {
      this.tooltip = r.string();
      if (this.tooltip.length === 0) {
        if (this.menuType === 1) {
          this.tooltip = "Ok";
        } else if (this.menuType === 4) {
          this.tooltip = "Select";
        } else if (this.menuType === 5) {
          this.tooltip = "Select";
        } else if (this.menuType === 6) {
          this.tooltip = "Continue";
        }
      }
    }

    // Set click mask based on menu type
    if (this.menuType === 1 || this.menuType === 4 || this.menuType === 5) {
      this.clickMask |= 4194304;
    }

    if (this.menuType === 6) {
      this.clickMask |= 1;
    }
  }

  private decodeIf3(r: Reader): void {
    r.u8(); // Skip the 0xFF marker
    this.isIf3 = true;

    this.type = r.u8();
    this.contentType = r.u16();
    this.originalX = r.i16();
    this.originalY = r.i16();
    this.originalWidth = r.u16();

    if (this.type === 9) {
      this.originalHeight = r.i16();
    } else {
      this.originalHeight = r.u16();
    }

    this.widthMode = r.i8();
    this.heightMode = r.i8();
    this.xPositionMode = r.i8();
    this.yPositionMode = r.i8();

    this.parentId = <WidgetID>r.u16();
    if (this.parentId === 0xffff) {
      this.parentId = <WidgetID>-1;
    } else {
      this.parentId = <WidgetID>(this.parentId + (this.id & ~0xffff));
    }

    this.isHidden = r.u8() === 1;

    // Type-specific IF3 decoding
    this.decodeIf3TypeSpecific(r);

    // Common IF3 properties
    this.clickMask = r.u24();
    this.name = r.string();

    // Actions
    const actionCount = r.u8();
    if (actionCount > 0) {
      this.actions = new Array(actionCount);
      for (let i = 0; i < actionCount; i++) {
        this.actions[i] = r.string();
      }
    }

    // Drag properties
    this.dragDeadZone = r.u8();
    this.dragDeadTime = r.u8();
    this.dragRenderBehavior = r.u8() === 1;
    this.targetVerb = r.string();

    // Event listeners
    this.onLoadListener = this.decodeListener(r);
    this.onMouseOverListener = this.decodeListener(r);
    this.onMouseLeaveListener = this.decodeListener(r);
    this.onTargetLeaveListener = this.decodeListener(r);
    this.onTargetEnterListener = this.decodeListener(r);
    this.onVarTransmitListener = this.decodeListener(r);
    this.onInvTransmitListener = this.decodeListener(r);
    this.onStatTransmitListener = this.decodeListener(r);
    this.onTimerListener = this.decodeListener(r);
    this.onOpListener = this.decodeListener(r);
    this.onMouseRepeatListener = this.decodeListener(r);
    this.onClickListener = this.decodeListener(r);
    this.onClickRepeatListener = this.decodeListener(r);
    this.onReleaseListener = this.decodeListener(r);
    this.onHoldListener = this.decodeListener(r);
    this.onDragListener = this.decodeListener(r);
    this.onDragCompleteListener = this.decodeListener(r);
    this.onScrollWheelListener = this.decodeListener(r);

    // Triggers
    this.varTransmitTriggers = this.decodeTriggers(r);
    this.invTransmitTriggers = this.decodeTriggers(r);
    this.statTransmitTriggers = this.decodeTriggers(r);
  }

  private decodeIf3TypeSpecific(r: Reader): void {
    switch (this.type) {
      case 0: // Container
        this.scrollWidth = r.u16();
        this.scrollHeight = r.u16();
        this.noClickThrough = r.u8() === 1;
        break;

      case 3: // Rectangle
        this.textColor = r.i32();
        this.filled = r.u8() === 1;
        this.opacity = r.u8();
        break;

      case 4: // Text
        this.fontId = <FontID>r.u16();
        if (this.fontId === 0xffff) {
          this.fontId = <FontID>-1;
        }
        this.text = r.string();
        this.lineHeight = r.u8();
        this.xTextAlignment = r.u8();
        this.yTextAlignment = r.u8();
        this.textShadowed = r.u8() === 1;
        this.textColor = r.i32();
        break;

      case 5: // Sprite
        this.spriteId = <SpriteID>r.i32();
        this.textureId = <TextureID>r.u16();
        this.spriteTiling = r.u8() === 1;
        this.opacity = r.u8();
        this.borderType = r.u8();
        this.shadowColor = r.i32();
        this.flippedVertically = r.u8() === 1;
        this.flippedHorizontally = r.u8() === 1;
        break;

      case 6: // Model
        this.modelType = 1;
        this.modelId = <ModelID>r.u16();
        if (this.modelId === 0xffff) {
          this.modelId = <ModelID>-1;
        }
        this.offsetX2d = r.i16();
        this.offsetY2d = r.i16();
        this.rotationX = r.u16();
        this.rotationZ = r.u16();
        this.rotationY = r.u16();
        this.modelZoom = r.u16();
        this.animation = <AnimationID>r.u16();
        if (this.animation === 0xffff) {
          this.animation = <AnimationID>-1;
        }
        this.orthogonal = r.u8() === 1;
        r.u16(); // Skip unknown value
        if (this.widthMode !== 0) {
          this.modelHeightOverride = r.u16();
        }
        if (this.heightMode !== 0) {
          r.u16(); // Skip unknown value
        }
        break;

      case 9: // Line
        this.lineWidth = r.u8();
        this.textColor = r.i32();
        this.lineDirection = r.u8() === 1;
        break;
    }
  }

  private decodeListener(r: Reader): (string | number)[] | null {
    const count = r.u8();
    if (count === 0) {
      return null;
    }

    const listener = new Array<string | number>(count);
    for (let i = 0; i < count; i++) {
      const type = r.u8();
      if (type === 0) {
        listener[i] = r.i32();
      } else if (type === 1) {
        listener[i] = r.string();
      }
    }

    this.hasListener = true;
    return listener;
  }

  private decodeTriggers(r: Reader): number[] | null {
    const count = r.u8();
    if (count === 0) {
      return null;
    }

    const triggers = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      triggers[i] = r.i32();
    }

    return triggers;
  }
}
