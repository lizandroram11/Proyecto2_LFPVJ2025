import { Instruction } from "../abstract/Instruction";
import { DataType } from "../tools/DataType";

export class Primitive implements Instruction {
  row: number;
  column: number;
  private type: DataType;
  private value: string;

  constructor(value: string, type: DataType, row: number, column: number) {
    this.row = row;
    this.column = column;
    this.value = value;
    this.type = type;
  }

  transpiler(): string {
    return this.value;
  }

  public getValue(): string | number | boolean {
    switch (this.type) {
      case DataType.INT:
        return parseInt(this.value);
      case DataType.FLOAT:
        return parseFloat(this.value);
      case DataType.BOOL:
        return this.value === "true";
      default:
        return this.value;
    }
  }
}