import { Reader } from "../Reader";
import { VarbitID, VarPID } from "../types";

export interface EntityOp {
  text: string | null;
  conditionals?: ConditionalOp[];
  subs?: EntityOps;
}

export interface ConditionalOp {
  text: string;

  varp?: VarPID;
  varbit?: VarbitID;

  min: number;
  max: number;
}

export class EntityOps extends Map<number, EntityOp> {
  public decodeOp(r: Reader, opID: number): void {
    const op = this.getOrCreate(opID);
    op.text = r.stringNullHidden();
  }

  public decodeSubOp(r: Reader): void {
    const op = this.getOrCreate(r.u8(), r.u8());
    op.text = r.string();
  }

  public decodeConditionalOp(r: Reader): void {
    const op = this.getOrCreate(r.u8());
    const varp = r.u16();
    const varbit = r.u16();
    const cop: ConditionalOp = {
      min: r.i32(),
      max: r.i32(),
      text: r.string(),
    };
    if (varp != 0xffff) {
      cop.varp = varp as VarPID;
    }
    if (varbit != 0xffff) {
      cop.varbit = varbit as VarbitID;
    }
    (op.conditionals ??= []).push(cop);
  }

  public decodeConditionalSubOp(r: Reader): void {
    const op = this.getOrCreate(r.u8(), r.u16());
    const varp = r.u16();
    const varbit = r.u16();
    const cop: ConditionalOp = {
      min: r.i32(),
      max: r.i32(),
      text: r.string(),
    };
    if (varp != 0xffff) {
      cop.varp = varp as VarPID;
    }
    if (varbit != 0xffff) {
      cop.varbit = varbit as VarbitID;
    }
    (op.conditionals ??= []).push(cop);
  }

  public getOrCreate(index: number, subIndex?: number): EntityOp {
    let v = this.get(index);
    if (!v) {
      v = {} as EntityOp;
      this.set(index, v);
    }
    if (subIndex == null) {
      return v;
    }
    return (v.subs ??= new EntityOps()).getOrCreate(subIndex);
  }
}
