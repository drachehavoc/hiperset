/// <reference types="node" />





















// import createTmpLogger from 'debug-to-tmp'
// import type * as ts from 'typescript/lib/tsserverlibrary';

// type TS = typeof ts

// const tmplog = createTmpLogger({
//   subfolder: 'hiperset',
//   filename: 'hiperset-tsserver-plugin.log',
// })

// class TSServerHelpers {
//   static findTokenAtPosition(ts: TS, sourceFile: ts.SourceFile, position: number): ts.Node | undefined {
//     function find(node: ts.Node): ts.Node | undefined {
//       if (position >= node.getStart() && position <= node.getEnd()) {
//         return ts.forEachChild(node, find) || node
//       }
//     }
//     return find(sourceFile);
//   }

//   static checkIsLabeledStatement(ts: TS, node: ts.Node | undefined, expectedLabelName?: string): boolean {
//     // se logo de início não encontrar um nó, já retorna false
//     if (!node) return false

//     // guarda o nó atual para começar a verificação
//     let current: ts.Node | undefined = node

//     // Subimos a árvore para verificar se o nó atual faz parte de um LabeledStatement
//     while (current) {
//       // Ignora se dectar estar dentro de um objeto
//       if (ts.isObjectLiteralExpression(current)) return false

//       // Verifica se é um LabeledStatement e caso seja, se o nome do label é o esperado
//       if (ts.isLabeledStatement(current)) {
//         const labelName = current.label.getText();
//         return expectedLabelName ? labelName === expectedLabelName : true
//       }

//       // Continua subindo a árvore
//       current = current.parent

//       // se chegar na raiz do arquivo, para de subir
//       if (!current || ts.isSourceFile(current)) break
//     }

//     // Se não for encontrado um LabeledStatement ou o nome do label não corresponder, retornamos false
//     return false
//   }
// }


// function SuggestionsHipersetLabel(
//   ts: TS,
//   sourceFile: ts.SourceFile,
//   position: number,
//   fileName: string,
//   prior: ts.WithMetadata<ts.CompletionInfo> | undefined
// ) {
//   if (!sourceFile) return prior;

//   // 1. Encontrar o nó no cursor
//   const node = TSServerHelpers.findTokenAtPosition(ts, sourceFile, position);

//   // 2. Verificar se o contexto é um LabeledStatement chamado "hiperset"
//   const isLabeledHiperset = TSServerHelpers.checkIsLabeledStatement(ts, node, 'hiperset');

//   if (!isLabeledHiperset) {
//     return prior;
//   }

//   tmplog(`✅ Contexto LABEL 'hiperset' detectado em: ${fileName}`);

//   let pos = 0;
//   const cstm: ts.CompletionEntry[] = [
//     {
//       name: "🚀_HIPERSET_REAL_7",
//       kind: ts.ScriptElementKind.variableElement,
//       kindModifiers: "deprecated",
//       sortText: "00000" + pos++,
//     },
//     {
//       name: "🚀_HIPERSET_REAL_1",
//       kind: ts.ScriptElementKind.variableElement,
//       sortText: "00000" + pos++
//     },
//   ];

//   if (prior) {
//     return { ...prior, entries: [...prior.entries, ...cstm] };
//   }

//   return {
//     isGlobalCompletion: false,
//     isMemberCompletion: false,
//     isNewIdentifierLocation: false,
//     entries: cstm
//   };
// }

// export = function init(modules: { typescript: typeof ts }) {
//   const ts = modules.typescript;

//   function create(info: ts.server.PluginCreateInfo) {
//     const ls = info.languageService;
//     const oldGetCompletions = ls.getCompletionsAtPosition;
//     const oldGetSemanticDiagnostics = ls.getSemanticDiagnostics;

//     // Suggestões 
//     ls.getCompletionsAtPosition = (fileName, position, options, data) => {
//       const prior = oldGetCompletions.call(ls, fileName, position, options, data)
//       const program = ls.getProgram()
//       const sourceFile = program?.getSourceFile(fileName)
//       return SuggestionsHipersetLabel(ts, sourceFile!, position, fileName, prior)
//     }

//     //
//     ls.getSemanticDiagnostics = (fileName) => {
//       // Pega os erros que o TS já encontrou (erros de sintaxe, tipos, etc)
//       const prior = oldGetSemanticDiagnostics(fileName);

//       const program = ls.getProgram();
//       const sourceFile = program?.getSourceFile(fileName);
//       if (!sourceFile) return prior;

//       const extraDiagnostics: ts.Diagnostic[] = [];

//       // Função para percorrer o arquivo procurando por labels 'hiperset'
//       function validate(node: ts.Node) {
//         if (modules.typescript.isLabeledStatement(node)) {
//           const labelName = node.label.getText();

//           if (labelName === 'hiperset') {
//             // O que vem depois do label (ex: hiperset: "nono")
//             const statement = node.statement;

//             // Verifica se é um ExpressionStatement com uma StringLiteral
//             if (
//               modules.typescript.isExpressionStatement(statement) &&
//               modules.typescript.isStringLiteral(statement.expression)
//             ) {
//               const value = statement.expression.text; // o texto dentro das aspas

//               if (value === "nono") {
//                 // Criamos o erro personalizado
//                 extraDiagnostics.push({
//                   file: sourceFile,
//                   start: statement.expression.getStart(), // Onde o erro começa
//                   length: statement.expression.getWidth(), // Tamanho do erro (sublinha a palavra)
//                   messageText: `O valor "${value}" é proibido em hiperset!`,
//                   category: modules.typescript.DiagnosticCategory.Error, // Pode ser Error, Warning ou Suggestion
//                   code: 666, // Um código numérico qualquer para o seu erro
//                 });
//               }
//             }
//           }
//         }

//         // Continua percorrendo os filhos do nó atual
//         modules.typescript.forEachChild(node, validate);
//       }

//       validate(sourceFile);

//       // Retorna os erros originais + os seus erros novos
//       return [...prior, ...extraDiagnostics];
//     };


//     return ls
//   }

//   return { create };
// }