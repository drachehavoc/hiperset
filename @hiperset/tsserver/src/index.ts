/// <reference types="node" />
import createLogger from 'debug-to-tmp'
import type * as ts from 'typescript/lib/tsserverlibrary';

const tmplog = createLogger({ 
  subfolder: 'hiperset',
  filename: 'hiperset-tsserver-plugin.log', 
})

tmplog("------> here we go!")

export = function init(modules: { typescript: typeof ts }) {
  tmplog("fn init")

  function create(info: ts.server.PluginCreateInfo) {
    tmplog("fn create")
    const ls = info.languageService;
    
    // 2. Guardamos a função original
    const oldGetCompletions = ls.getCompletionsAtPosition;

    // 3. Sobrescrevemos no objeto original (Monkey Patch)
    ls.getCompletionsAtPosition = (fileName, position, options, data) => {
      tmplog("getCompletionsAtPosition")

      return {
        isGlobalCompletion: false,
        isMemberCompletion: false,
        isNewIdentifierLocation: false,
        entries: [
          {
            name    : "🚀_HIPERSET_REAL_6",
            kind    : modules.typescript.ScriptElementKind.variableElement,
            sortText: "0000"
          },
          {
            name    : "🚀_HIPERSET_REAL_1",
            kind    : modules.typescript.ScriptElementKind.variableElement,
            sortText: "0000"
          }
        ]
      }
    }

    return ls
  }

  return { create }
};
















// /// <reference types="node" />
// import type * as ts from 'typescript/lib/tsserverlibrary'
// import { inspect } from 'node:util'
// import createLogger from 'debug-to-tmp'

// const pid = process.pid;
// const _tmplog = createLogger({ filename: 'hiperset-tsserver-plugin.log', subfolder: 'hiperset' });
// const tmplog = (msg: string) => _tmplog(`[${pid}] ${msg}`);

// tmplog('------------------')
// tmplog('Arquivo Carregado')

// export = function init(modules: { typescript: typeof ts }) {
//   tmplog(`function init(…)`);
//   tmplog(inspect(modules))
// }