import { TSESLint, TSESTree } from "@typescript-eslint/utils"
import { getStaticValue } from "@typescript-eslint/utils/ast-utils"
import $path from "path"
import getBundleImportSync from "./fn.globalCachedBundleImport.js"

const _brand_ = {
  name: 'Hiperset',
  label: 'hiperset',
  unicode: '⧎'
}

type ErrorsName =
  | "tempError"
  | "InvalidReglueSyntaxe"
  | "InvalidReglueLabel"
  | "ImpossibleInferValue"
  | "DuplicatedKey"
type RuleModule = TSESLint.RuleModule<ErrorsName, []>
type RuleCtx = TSESLint.RuleContext<ErrorsName, []>
type RuleListener = TSESLint.RuleListener
type RuleMeta = TSESLint.RuleMetaData<ErrorsName>
type NodeVarDecl = TSESTree.VariableDeclarator
type NodeAssExpr = TSESTree.AssignmentExpression
type NodeLblStmt = TSESTree.LabeledStatement
type NodeBlkStmt = TSESTree.BlockStatement
type NodeExprStrLiteralStmt = TSESTree.ExpressionStatement & { expression: TSESTree.StringLiteral }
type NodeVar = NodeVarDecl | NodeAssExpr
type Node = TSESTree.Node

export class Hiperset implements RuleModule {
  #ruleFilesToLoad: { namespace?: string, path: string, node: Node }[] = []
  #loadedRules: Record<string, any> = {}

  /**
   * Definição do ESLint Plugin
   */
  static readonly plugin = { hiperset: { rules: { plugin: new Hiperset() } } }

  /**
   * Meta dados da regra
   */
  readonly meta: RuleMeta = {
    type: "problem",
    fixable: "code",
    messages: {
      tempError: `${_brand_.unicode} {{detail}}`,
      InvalidReglueSyntaxe: `${_brand_.unicode} `
        + `Existem apenas três formas válidas de blocos 'regle:'\n `
        + `- regra única sem parâmetros: reglue: "nome_da_regra"\n `
        + `- regra única com parâmetros: reglue: nome_da_regra: { ⋯ }\n `
        + `- múltiplas regras          : reglue: { ⋯ }\n`
        + `veja a documentação para mais detalhes.`,
      ImpossibleInferValue: `${_brand_.unicode} `
        + `Não é possível inferir o valor desta expressão e por isso ela será descartada.`,
      InvalidReglueLabel: `${_brand_.unicode} `
        + `Blocos 'regle:' devem ter labels compatíveis com variaveis, atributos, funções ou métodos.`,
      DuplicatedKey: `${_brand_.unicode} `
        + `A chave '{{key}}' foi definida mais de uma vez dentro do mesmo bloco ${_brand_.name}.\n`
        + `- isso acarretará na sobrescrição do valor anterior.\n`
        + `- fazendo com que apenas o último valor seja considerado.\n`
        + `- disperdiçando tempo de processamento e memória durante a verificação eslint\n`
        + `- verifique se isso é intencional.`
    },
    schema: []
  }


  /**
   * Infere o valor de um nó AST dentro do contexto fornecido.
   */
  #inferValue(context: RuleCtx, node: Node): any {
    const { type } = node

    // Este é o ponto de entrada, entre muitas aspas, pois ele testa `label: _value_`, 
    // neste momento não é possivel inferir o valor de _value_ sem analisar o body do 
    // LabeledStatement, então aqui é possível apenas identificar o label e passar o body 
    // para outra chamada recursiva.
    if (type === "LabeledStatement") {
      const label = node.label.name
      const nextNode = node.body
      const value = this.#inferValue(context, nextNode)
      return { [label]: value }
    }

    // Este ponto só é executado após identificar o LabeledStatement, aqui é tratado 
    // diretivas ("valores soltos") veja os exemplos abaixo:
    // - `reglue: "string literal"`
    // - `reglue: 42`
    // - `reglue: { "string literal" }`
    // - `reglue: { 42 }`
    // - `reglue: { someVariable }`
    if (type === "ExpressionStatement") {
      const expr = node.expression
      const scope = context.sourceCode.getScope(node)
      const staticValue = getStaticValue(expr, scope) // infere o valor estático da expressão
      if (!staticValue)
        return context.report({ node: expr, messageId: "ImpossibleInferValue" })
      return staticValue.value
    }

    // Este ponto trata blocos do tipo `{ ⋯ }`, por isso é necessário iterar sobre 
    // todos os nós filhos analisando a sua tipagem e inferindo o valor de cada um 
    // deles, para montar o objeto final.
    if (type === "BlockStatement") {
      // um recipiente para armazenar os valores inferidos do bloco
      const blockResult: any = {}
      // um recipiente para armazenar as chaves e nós, para que possamos detectar chaves 
      // repetidas e reportar erros caso necessário.
      const repeatedKeys: Record<string, Node[]> = {}
      // Itera sobre cada declaração ou expressão dentro do bloco
      node.body.forEach((stmt, index) => {
        // Recursão para inferir o valor de cada declaração ou expressão dentro do bloco
        const inferedValue = this.#inferValue(context, stmt)
        // Se ao percorrer o corpo do bloco e for encontrado uma declaração tipo
        // `label: {⋯}`, injetamos o nome e o valor direto.
        if (stmt.type === "LabeledStatement") {
          const label = stmt.label.name
          repeatedKeys[label] ??= []
          repeatedKeys[label].push(stmt)
          Object.assign(blockResult, inferedValue)
          return
        }
        // Nos casos onde for encontrado uma atribuição do tipo `key: value`, injetamos 
        // a chave e o valor no objeto resultante.
        if (stmt.type === "ExpressionStatement"
          && stmt.expression.type === "Identifier") {
          const label = stmt.expression.name
          repeatedKeys[label] ??= []
          repeatedKeys[label].push(stmt)
          return blockResult[label] = inferedValue
        }
        // Nos casos onde for encontraram uma diretiva solta, como `"string literal"`, ou 
        // `42`, ou `varname` consideramos como valor posicional, isso significa se já 
        // existem 3 chaves no objeto, o próximo valor será a chave 3.
        blockResult[index] = inferedValue
      })
      Object.entries(repeatedKeys).forEach(([key, nodes]) => {
        if (nodes.length < 2) return
        const messageId = "DuplicatedKey"
        const data = { key }
        nodes.forEach(node => context.report({ node, messageId, data }))
      })
      // flush dos valores inferidos do bloco
      return blockResult
    }

    // fallback, se nada funcionar, é reportado erro informando que não foi possível 
    // inferir valor algum e que a entrada será desconsiderada.
    context.report({ node, messageId: "ImpossibleInferValue" })
    return undefined
  }

  #isStringLiteralStatement(node: Node): node is NodeExprStrLiteralStmt {
    return node.type === "ExpressionStatement"
      && node.expression.type === "Literal"
      && typeof node.expression.value === "string"
  }

  #load_importRulesFromFile(context: RuleCtx, data: { node: Node, path: string, namespace?: string }) {
    const folder = context.filename.replace(/[^\/\\]+$/, "")
    const { node, path } = data
    const absolutePath = path.startsWith("./")
      ? $path.resolve(folder, path)
      : $path.resolve(process.cwd(), path)
    try {
      const bundle = getBundleImportSync(absolutePath)
      if (!data.namespace) {
        Object.assign(this.#loadedRules, bundle)
        return
      }
      this.#loadedRules[data.namespace] = bundle
    } catch (err) {
      context.report({
        node,
        messageId: "tempError",
        data: { detail: `@TODO: d8dca4d0-2696-4475-b83b-00f710bb8cf9 Erro ao importar o arquivo: '${absolutePath}'\n- ${err}` }
      })
    }
  }

  #load_validateDuplicatedFileLoaded(context: RuleCtx, node: Node) {
    const currentFilePath = context.filename
    const rpt: Record<string, Node[]> = {}

    this.#ruleFilesToLoad.forEach(file => {
      const { namespace, path, node } = file
      const key = namespace ? `${namespace}:${path}` : path
      rpt[key] = rpt[key] ? [...rpt[key], node] : [node]
    })

    Object.entries(rpt).forEach(([key, nodes]) => {
      if (nodes.length < 2) return
      const splitKey = key.split(":")
      const [namespace, path] = splitKey.length > 1
        ? [splitKey[0], splitKey.slice(1).join(":")]
        : [undefined, splitKey[0]]
      const messageId = "tempError"
      const positions = nodes.map(n => {
        const { line, column } = n.loc.start;
        return `  at ${currentFilePath}:${line}:${column + 1}`
      }).join("\n")
      const data = namespace
        ? { detail: `@TODO: 406b17d7-63f9-4389-a65e-ac8631b1040a O caminho '${path}' se repetiu para o namespace '${namespace}':\n${positions}` }
        : { detail: `@TODO: a7d488e6-f1b0-4306-acb9-e46d362458aa O caminho '${path}' repetiu:\n${positions}` }
      nodes.forEach(node => {
        context.report({ node, messageId, data })
      })
    })
  }

  #load_getRuleFilesPath(context: RuleCtx, node: Node) {
    if (this.#isStringLiteralStatement(node)) {
      const path = node.expression.value
      const value = { path, node }
      this.#ruleFilesToLoad.push(value)
      this.#load_importRulesFromFile(context, value)
      return this.#ruleFilesToLoad
    }

    if (node.type === "LabeledStatement" && this.#isStringLiteralStatement(node.body)) {
      const namespace = node.label.name
      const path = node.body.expression.value
      const nodet = node.type === "LabeledStatement" ? node.body : node
      const value = { namespace, path, node: nodet }
      this.#ruleFilesToLoad.push(value)
      this.#load_importRulesFromFile(context, value)
      return this.#ruleFilesToLoad
    }

    if (node.type === "BlockStatement") {
      for (const stmt of node.body) {
        if (this.#load_getRuleFilesPath(context, stmt))
          continue
        context.report({
          node: stmt,
          messageId: "tempError",
          data: { detail: `@TODO: db8d4ff1-8c7f-4dca-9084-affb3a96e1a0` }
        })
      }
      this.#load_validateDuplicatedFileLoaded(context, node)
      return this.#ruleFilesToLoad
    }

    context.report({
      node,
      messageId: "tempError",
      data: { detail: `@TODO: 831f488c-ae3b-449a-b10a-0b45b3835c22` }
    })
  }

  #load(context: RuleCtx, node: Node) {
    this.#load_getRuleFilesPath(context, node)
  }

  #reservedLabels(context: RuleCtx, label: NodeLblStmt) {
    if (label.label.name === "load") {
      this.#load(context, label.body)
      return
    }

    if (label.label.name === "define")
      return

    if (label.label.name === "type")
      return

    context.report({
      node: label.label,
      messageId: "tempError",
      data: { detail: `@TODO: d20e1366-2029-4d25-b266-6e4dbd016708` }
    })
  }

  /**
   * 
   */
  create(context: RuleCtx): RuleListener {
    this.#ruleFilesToLoad = []
    this.#loadedRules = {}
    return {
      LabeledStatement: (node) => {
        const name = node.label.name
        if (name !== _brand_.label)
          return
        if (node.body.type === "LabeledStatement")
          return this.#reservedLabels(context, node.body)
        context.report(
          {
            node: node.body,
            messageId: "tempError",
            data: {
              detail: `@TODO:`
                + ` aqui deve ser mostrado erro onde a validação de syntaxe nem possa ser feita\n`
                + ` - na mensagem deve ser explicado que blocos ${_brand_.name} devem seguir o padrão: `
                + `${_brand_.label}: [load|define|type]: ⋯\n`
            }
          })
      },
    }
  }
}

export default Hiperset