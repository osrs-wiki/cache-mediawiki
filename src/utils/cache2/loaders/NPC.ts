import type { CacheProvider } from "../Cache";
import { MultiChildrenEntity } from "../MultiChildrenEntity";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import {
  AnimationID,
  CategoryID,
  GameValType,
  HSL,
  ModelID,
  NPCID,
  Params,
  SpriteID,
  TextureID,
  VarbitID,
  VarPID,
} from "../types";

@Typed
export class NPC extends MultiChildrenEntity<NPC, NPCID> {
  constructor(id: NPCID) {
    super(id);
  }

  /**
   * Implementation of the abstract loadChild method.
   * Loads a child NPC by ID using the static load method.
   */
  protected async loadChild(
    cache: Promise<CacheProvider>,
    childId: NPCID
  ): Promise<NPC | null> {
    return NPC.load(cache, childId);
  }

  /**
   * Get the display name for this NPC.
   * @param cache The cache provider to load children from (if needed)
   * @returns The name following the specified criteria:
   *   1. If name is not "null", return it
   *   2. If name is "null" and NPC has multiChildren, return name of first child
   *   3. Otherwise return the name (likely "null")
   */
  public async getName(cache: Promise<CacheProvider>): Promise<string> {
    // If name is not "null", return it
    if (this.name !== "null") {
      return this.name;
    }

    // If name is "null" and NPC has multiChildren, return name of first child
    if (this.hasMultiChildren()) {
      try {
        const children = await this.getMultiChildren(cache);
        if (children.length > 0) {
          const firstChild = children[0];
          // Recursively call getName on the first child to handle nested cases
          return await firstChild.getName(cache);
        }
      } catch (error) {
        console.warn(
          `Failed to get name from multiChildren for NPC ${this.id}:`,
          error
        );
      }
    }

    // Otherwise return the name (likely "null")
    return this.name;
  }

  public static readonly index = 2;
  public static readonly archive = 9;
  public static readonly gameval = GameValType.Npcs;

  public models: ModelID[] = <ModelID[]>[];
  public name = "null";
  public size = 1;
  public standingAnimation = <AnimationID>-1;
  public walkingAnimation = <AnimationID>-1;
  public idleRotateLeftAnimation = <AnimationID>-1;
  public idleRotateRightAnimation = <AnimationID>-1;
  public rotate180Animation = <AnimationID>-1;
  public rotateLeftAnimation = <AnimationID>-1;
  public rotateRightAnimation = <AnimationID>-1;
  public category = <CategoryID>-1;
  public actions: (string | null)[] = [null, null, null, null, null];
  public recolorFrom: HSL[] = <HSL[]>[];
  public recolorTo: HSL[] = <HSL[]>[];
  public retextureFrom: TextureID[] = <TextureID[]>[];
  public retextureTo: TextureID[] = <TextureID[]>[];
  public chatheadModels: ModelID[] = <ModelID[]>[];
  public isMinimapVisible = true;
  public combatLevel = -1;
  public widthScale = 128;
  public heightScale = 128;
  public isVisible = false;
  public ambient = 0;
  public contrast = 0;
  public headIconArchive: SpriteID[] = [];
  public headIconSpriteIndex: number[] = [];
  public rotationSpeed = 32;
  public varbit = <VarbitID>-1;
  public varp = <VarPID>-1;
  public multiChildren: NPCID[] = <NPCID[]>[];
  public oobChild = <NPCID>-1;
  public isInteractible = true;
  public isClickable = true;
  public isFollower = false;
  public lowPriorityOps = false;
  public runAnimation = <AnimationID>-1;
  public runRotate180Animation = <AnimationID>-1;
  public runRotateLeftAnimation = <AnimationID>-1;
  public runRotateRightAnimation = <AnimationID>-1;
  public crawlAnimation = <AnimationID>-1;
  public crawlRotate180Animation = <AnimationID>-1;
  public crawlRotateLeftAnimation = <AnimationID>-1;
  public crawlRotateRightAnimation = <AnimationID>-1;
  public attack?: number = undefined;
  public defence?: number = undefined;
  public strength?: number = undefined;
  public hitpoints?: number = undefined;
  public ranged?: number = undefined;
  public magic?: number = undefined;
  public height?: number = undefined;
  public params = new Params();
  public gameVal?: string;

  public static decode(r: Reader, id: NPCID): NPC {
    const v = new NPC(id);
    for (let opcode: number; (opcode = r.u8()) != 0; ) {
      switch (opcode) {
        case 1: {
          const len = r.u8();
          v.models = new Array(len);
          for (let i = 0; i < len; i++) {
            v.models[i] = <ModelID>r.u16();
          }
          break;
        }
        case 2:
          v.name = r.string();
          break;
        case 12:
          v.size = r.u8();
          break;
        case 13:
          v.standingAnimation = <AnimationID>r.u16();
          break;
        case 14:
          v.walkingAnimation = <AnimationID>r.u16();
          break;
        case 15:
          v.idleRotateLeftAnimation = <AnimationID>r.u16();
          break;
        case 16:
          v.idleRotateRightAnimation = <AnimationID>r.u16();
          break;
        case 17:
          v.walkingAnimation = <AnimationID>r.u16();
          v.rotate180Animation = <AnimationID>r.u16();
          v.rotateLeftAnimation = <AnimationID>r.u16();
          v.rotateRightAnimation = <AnimationID>r.u16();
          break;
        case 18:
          v.category = <CategoryID>r.u16();
          break;
        case 30:
        case 31:
        case 32:
        case 33:
        case 34:
          v.actions[opcode - 30] = r.stringNullHidden();
          break;
        case 40: {
          const len = r.u8();
          v.recolorFrom = new Array(len);
          v.recolorTo = new Array(len);
          for (let i = 0; i < len; i++) {
            v.recolorFrom[i] = <HSL>r.u16();
            v.recolorTo[i] = <HSL>r.u16();
          }
          break;
        }
        case 41: {
          const len = r.u8();
          v.retextureFrom = new Array(len);
          v.retextureTo = new Array(len);
          for (let i = 0; i < len; i++) {
            v.retextureFrom[i] = <TextureID>r.u16();
            v.retextureTo[i] = <TextureID>r.u16();
          }
          break;
        }
        case 60: {
          const len = r.u8();
          v.chatheadModels = new Array(len);
          for (let i = 0; i < len; i++) {
            v.chatheadModels[i] = <ModelID>r.u16();
          }
          break;
        }
        case 74:
          v.attack = r.u16();
          break;
        case 75:
          v.defence = r.u16();
          break;
        case 76:
          v.strength = r.u16();
          break;
        case 77:
          v.hitpoints = r.u16();
          break;
        case 78:
          v.ranged = r.u16();
          break;
        case 79:
          v.magic = r.u16();
          break;
        case 93:
          v.isMinimapVisible = false;
          break;
        case 95:
          v.combatLevel = r.u16();
          break;
        case 97:
          v.widthScale = r.u16();
          break;
        case 98:
          v.heightScale = r.u16();
          break;
        case 99:
          v.isVisible = true;
          break;
        case 100:
          v.ambient = r.i8();
          break;
        case 101:
          v.contrast = r.i8();
          break;
        case 102:
          if (!r.isAfter({ era: "osrs", indexRevision: 3642 })) {
            v.headIconArchive = [-1 as SpriteID];
            v.headIconSpriteIndex = [r.u16()];
          } else {
            const bitfield = r.u8();
            v.headIconArchive = [];
            v.headIconSpriteIndex = [];
            for (let bits = bitfield; bits != 0; bits >>= 1) {
              if ((bits & 1) == 0) {
                v.headIconArchive.push(-1 as SpriteID);
                v.headIconSpriteIndex.push(-1);
              } else {
                v.headIconArchive.push(r.s2o4n() as SpriteID);
                v.headIconSpriteIndex.push(r.u8o16m1());
              }
            }
          }
          break;
        case 103:
          v.rotationSpeed = r.u16();
          break;
        case 106: {
          v.varbit = <VarbitID>r.u16n();
          v.varp = <VarPID>r.u16n();
          const len = r.u8p1();
          v.multiChildren = new Array(len);
          for (let i = 0; i < len; i++) {
            v.multiChildren[i] = <NPCID>r.u16n();
          }
          break;
        }
        case 107:
          v.isInteractible = false;
          break;
        case 109:
          v.isClickable = false;
          break;
        case 111:
          // removed in 220
          v.isFollower = true;
          v.lowPriorityOps = true;
          break;
        case 114:
          v.runAnimation = <AnimationID>r.u16();
          break;
        case 115:
          v.runAnimation = <AnimationID>r.u16();
          v.runRotate180Animation = <AnimationID>r.u16();
          v.runRotateLeftAnimation = <AnimationID>r.u16();
          v.runRotateRightAnimation = <AnimationID>r.u16();
          break;
        case 116:
          v.crawlAnimation = <AnimationID>r.u16();
          break;
        case 117:
          v.crawlAnimation = <AnimationID>r.u16();
          v.crawlRotate180Animation = <AnimationID>r.u16();
          v.crawlRotateLeftAnimation = <AnimationID>r.u16();
          v.crawlRotateRightAnimation = <AnimationID>r.u16();
          break;
        case 118: {
          v.varbit = <VarbitID>r.u16n();
          v.varp = <VarPID>r.u16n();
          v.oobChild = <NPCID>r.u16n();
          const len = r.u8p1();
          v.multiChildren = new Array(len);
          for (let i = 0; i < len; i++) {
            v.multiChildren[i] = <NPCID>r.u16n();
          }
          break;
        }
        case 122:
          v.isFollower = true;
          break;
        case 123:
          v.lowPriorityOps = true;
          break;
        case 124:
          v.height = r.u16();
          break;
        case 249:
          v.params = r.params();
          break;
        default:
          throw new Error(`unknown opcode ${opcode}`);
      }
    }
    return v;
  }
}
