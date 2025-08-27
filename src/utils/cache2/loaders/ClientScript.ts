export enum ClientScript1Opcode {
  RETURN = 0,
  BOOSTED_SKILL_LEVELS = 1,
  REAL_SKILL_LEVELS = 2,
  SKILL_EXPERIENCE = 3,
  WIDGET_CONTAINS_ITEM_GET_QUANTITY = 4,
  VARP = 5,
  EXPERIENCE_AT_LEVEL_FOR_SKILL = 6,
  VARP_TIMES_469 = 7,
  COMBAT_LEVEL = 8,
  TOTAL_LEVEL = 9,
  WIDGET_CONTAINS_ITEM_STAR = 10,
  RUN_ENERGY = 11,
  WEIGHT = 12,
  VARP_TESTBIT = 13,
  VARBIT = 14,
  MINUS = 15,
  DIV = 16,
  MUL = 17,
  WORLD_X = 18,
  WORLD_Y = 19,
  CONSTANT = 20,
}

export class ClientScript1Instruction {
  public opcode!: ClientScript1Opcode;
  public operands: number[] = [];

  public static getArgumentCount(opcode: ClientScript1Opcode): number {
    const argumentCounts: Record<ClientScript1Opcode, number> = {
      [ClientScript1Opcode.RETURN]: 0,
      [ClientScript1Opcode.BOOSTED_SKILL_LEVELS]: 1,
      [ClientScript1Opcode.REAL_SKILL_LEVELS]: 1,
      [ClientScript1Opcode.SKILL_EXPERIENCE]: 1,
      [ClientScript1Opcode.WIDGET_CONTAINS_ITEM_GET_QUANTITY]: 3,
      [ClientScript1Opcode.VARP]: 1,
      [ClientScript1Opcode.EXPERIENCE_AT_LEVEL_FOR_SKILL]: 1,
      [ClientScript1Opcode.VARP_TIMES_469]: 1,
      [ClientScript1Opcode.COMBAT_LEVEL]: 1,
      [ClientScript1Opcode.TOTAL_LEVEL]: 0,
      [ClientScript1Opcode.WIDGET_CONTAINS_ITEM_STAR]: 3,
      [ClientScript1Opcode.RUN_ENERGY]: 0,
      [ClientScript1Opcode.WEIGHT]: 0,
      [ClientScript1Opcode.VARP_TESTBIT]: 2,
      [ClientScript1Opcode.VARBIT]: 1,
      [ClientScript1Opcode.MINUS]: 0,
      [ClientScript1Opcode.DIV]: 0,
      [ClientScript1Opcode.MUL]: 0,
      [ClientScript1Opcode.WORLD_X]: 0,
      [ClientScript1Opcode.WORLD_Y]: 1,
      [ClientScript1Opcode.CONSTANT]: 1,
    };
    return argumentCounts[opcode] || 0;
  }

  public static parseInstructions(
    bytecode: number[]
  ): ClientScript1Instruction[] {
    const instructions: ClientScript1Instruction[] = [];

    for (let i = 0; i < bytecode.length; ) {
      const instruction = new ClientScript1Instruction();
      instruction.opcode = bytecode[i++] as ClientScript1Opcode;

      const argumentCount = this.getArgumentCount(instruction.opcode);
      instruction.operands = bytecode.slice(i, i + argumentCount);
      i += argumentCount;

      instructions.push(instruction);
    }

    return instructions;
  }
}
