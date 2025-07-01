import { Instruction } from "../abstract/Instruction";

export class Identifier implements Instruction {

  row: number;
  column: number;
  private id: string;

  constructor(id: string, row: number, column: number) {
    this.row = row;
    this.column = column;
    this.id = id;
  }

  transpiler(): string {
    return this.id;
  }

  // ✅ Método nuevo para obtener el nombre del identificador
  public getName(): string {
    return this.id;
  }
}