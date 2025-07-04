import { PerFileLoadable } from "../Loadable";
import { Reader } from "../Reader";
import { Typed } from "../reflect";
import {
  AnimationID,
  AnimMayaID,
  AnimRestartMode,
  GameValType,
  KitOrItem,
  PoseID,
  PostAnimMoveMode,
  PreAnimMoveMode,
  SkeletonID,
  SoundEffectID,
} from "../types";
export class FrameSound {
  constructor(
    public id: SoundEffectID,
    public weight: number,
    public loops: number,
    location: number,
    public retain: number
  ) {
    this.offsetX = (location >> 16) & 0xff;
    this.offsetY = (location >> 8) & 0xff;
    this.maxDistance = location & 0xff;
    this.isAreaSound = location === 0;
  }
  public offsetX: number;
  public offsetY: number;
  public isAreaSound: boolean;
  public maxDistance: number;
}
export class Animation extends PerFileLoadable {
  constructor(public id: AnimationID) {
    super();
  }

  public static readonly index = 2;
  public static readonly archive = 12;
  public static readonly gameval = GameValType.Animations;

  public frameLengths?: number[] = undefined;
  public frameIDs?: [SkeletonID, PoseID][] = undefined;
  public chatheadFrameIDs?: [SkeletonID, PoseID][] = undefined;
  public animMayaID?: AnimMayaID = undefined;
  public animMayaStart = 0;
  public animMayaEnd = 0;
  public masks?: boolean[] = undefined;
  public debugName?: string;
  public frameStep = -1;
  public interleaveLeave?: number[] = undefined;
  public stretches = true;
  public priority = 5;
  public leftHandItem?: KitOrItem = undefined;
  public rightHandItem?: KitOrItem = undefined;
  public maxLoops?: number = undefined;
  public preAnimMove!: PreAnimMoveMode;
  public postAnimMove!: PostAnimMoveMode;
  public restartMode = AnimRestartMode.ResetLoops;
  public gameVal?: string;
  public sounds: Map<number, FrameSound[]> = new Map();

  public static decode(r: Reader, id: AnimationID): Animation {
    const v = new Animation(id);
    const [legacyFrameSounds, animMayaID, frameSounds, animMayaBounds] =
      r.isAfter({ era: "osrs", indexRevision: 4470 })
        ? [-1, 13, 14, 15]
        : [13, 14, 15, 16];
    for (let opcode: number; (opcode = r.u8()) != 0; ) {
      switch (opcode) {
        case 1: {
          const len = r.u16();
          v.frameLengths = new Array(len);
          v.frameIDs = new Array(len);
          for (let i = 0; i < len; i++) {
            v.frameLengths[i] = r.u16();
          }
          for (let i = 0; i < len; i++) {
            v.frameIDs[i] = [0 as SkeletonID, r.u16() as PoseID];
          }
          for (let i = 0; i < len; i++) {
            v.frameIDs[i][0] = r.u16() as SkeletonID;
          }
          break;
        }
        case 2:
          v.frameStep = r.u16();
          break;
        case 3: {
          const len = r.u8();
          v.interleaveLeave = new Array(len + 1);
          for (let i = 0; i < len; i++) {
            v.interleaveLeave[i] = r.u8();
          }
          v.interleaveLeave[len] = 9999999;
          break;
        }
        case 4:
          v.stretches = true;
          break;
        case 5:
          v.priority = r.u8();
          break;
        case 6:
          v.leftHandItem = r.kit();
          break;
        case 7:
          v.rightHandItem = r.kit();
          break;
        case 8:
          v.maxLoops = r.u8();
          break;
        case 9:
          v.preAnimMove = r.u8() as PreAnimMoveMode;
          break;
        case 10:
          v.postAnimMove = r.u8() as PostAnimMoveMode;
          break;
        case 11:
          v.restartMode = r.u8() as AnimRestartMode;
          break;
        case 12: {
          const len = r.u8();
          v.chatheadFrameIDs = new Array(len);
          for (let i = 0; i < len; i++) {
            v.chatheadFrameIDs[i] = [0 as SkeletonID, r.u16() as PoseID];
          }
          for (let i = 0; i < len; i++) {
            v.chatheadFrameIDs[i][0] = r.u16() as SkeletonID;
          }
          break;
        }
        case legacyFrameSounds: {
          const len = r.u8();
          for (let i = 0; i < len; i++) {
            readFrameSound(v, r, i);
          }
          break;
        }
        case animMayaID:
          v.animMayaID = r.i32() as AnimMayaID;
          break;
        case frameSounds: {
          const len = r.u16();
          for (let i = 0; i < len; i++) {
            const frame = r.u16();
            readFrameSound(v, r, frame);
          }
          break;
        }
        case animMayaBounds:
          v.animMayaStart = r.u16();
          v.animMayaEnd = r.u16();
          break;
        case 17: {
          v.masks = new Array(256);
          v.masks.fill(false);
          const len = r.u8();
          for (let i = 0; i < len; i++) {
            v.masks[r.u8()] = true;
          }
          break;
        }
        case 18:
          v.debugName = r.string();
          break;
        default:
          throw new Error(`unknown animation opcode ${opcode}`);
      }
    }

    const defaultAnimMode =
      v.interleaveLeave === undefined && v.masks == undefined
        ? PreAnimMoveMode.DelayMove
        : PreAnimMoveMode.Merge;

    v.preAnimMove ??= defaultAnimMode;
    v.postAnimMove ??= defaultAnimMode as any as PostAnimMoveMode;

    return v;
  }
}

function readFrameSound(v: Animation, r: Reader, frame: number): void {
  let sound: FrameSound;
  if (r.isAfter({ era: "osrs", indexRevision: 4106 })) {
    const id = r.u16();
    const weight = r.isAfter({ era: "osrs", indexRevision: 4470 })
      ? r.u8()
      : -1;
    const loops = r.u8();
    const location = r.u8();
    const retain = r.u8();
    sound = new FrameSound(
      id as SoundEffectID,
      weight,
      loops,
      location,
      retain
    );
  } else {
    const bits = r.u24();
    sound = new FrameSound(
      (bits >> 8) as SoundEffectID,
      -1,
      (bits >> 4) & 7,
      bits & 15,
      0
    );
  }

  if (sound.id >= 1 && sound.loops >= 1) {
    let list = v.sounds.get(frame);
    if (!list) {
      list = [];
      v.sounds.set(frame, list);
    }
    list.push(sound);
  }
}
