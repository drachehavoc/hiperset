// hiperset-logic.ts
import type * as ts from 'typescript';

export class HipersetValidator {
  // Sua lógica que já criamos
  static isHipersetLabel(node: ts.Node, typescript: typeof ts): boolean {
    let current: ts.Node | undefined = node;
    while (current) {
      if (typescript.isObjectLiteralExpression(current)) return false;
      if (typescript.isLabeledStatement(current)) {
        return current.label.getText() === 'hiperset';
      }
      current = current.parent;
    }
    return false;
  }

  static getInvalidValue(node: ts.LabeledStatement, typescript: typeof ts): string | null {
    const statement = node.statement;
    if (typescript.isExpressionStatement(statement) && typescript.isStringLiteral(statement.expression)) {
      if (statement.expression.text === "nono") {
        return statement.expression.text;
      }
    }
    return null;
  }
}