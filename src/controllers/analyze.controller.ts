import { Request, Response } from "express";
import { LexicalAnalyzer } from "../Analyzer/LexicalAnalyzer";
import { Token, Type } from "../Analyzer/Token";
import { SyntacticAnalyzer } from "../Analyzer/SyntacticAnalyzer";
import { Error } from "../Analyzer/Error";
import { Transpiler } from "../Analyzer/Transpiler";
import { Instruction } from "../models/abstract/Instruction";

export const home = (req: Request, res: Response) => {
  res.render("pages/index");
};

export const analyze = (req: Request, res: Response) => {
  const body = req.body;

  const scanner = new LexicalAnalyzer();
  const tokenList: Token[] = scanner.scanner(body);

  const parser = new SyntacticAnalyzer(tokenList);
  parser.parser();

  const errorScanner = scanner.getErrorList(); // Token[]
  const errorParser = parser.getErrors();      // Error[]

  let transpiledCode = "";
  let simulatedOutput: string[] = [];
  let symbolTable: { name: string; value: string | number | boolean }[] = [];

  if (errorParser.length === 0) {
    const transpiler = new Transpiler(tokenList);
    transpiler.parser();

    simulatedOutput = transpiler.simulateConsoleOutput();
    symbolTable = transpiler.getSymbolTable();

    transpiler.getInstructions().forEach((instruction: Instruction) => {
      transpiledCode += instruction.transpiler();
    });
  }

  // 🧾 Generar salida para consola
  let consoleOutput = "";

  if (errorScanner.length > 0 || errorParser.length > 0) {
    consoleOutput += "❌ Se encontraron errores durante el análisis.\n\n";

    errorScanner.forEach(err => {
      const typeDesc = err.getTypeTokenString();
      consoleOutput += `Línea ${err.getRow()}, Columna ${err.getColumn()}: ${err.getLexeme()} → tipo: ${typeDesc}\n`;
    });

    errorParser.forEach(err => {
      consoleOutput += `Línea ${err.getRow()}, Columna ${err.getColumn()}: ${err.getLexeme()} → ${err.getDescription()}\n`;
    });
  } else {
    if (simulatedOutput.length > 0) {
      consoleOutput = simulatedOutput.join("\n");
    } else {
      consoleOutput = "✅ Análisis completado sin errores.\n\nCódigo transpilado correctamente.";
    }
  }

  // 📤 Enviar respuesta al frontend
  res.json({
    tokens: tokenList,
    errors: errorScanner,
    syntacticErrors: errorParser,
    transpiledCode,
    colors: scanner.getColors(),
    consoleOutput,
    symbols: symbolTable
  });
};