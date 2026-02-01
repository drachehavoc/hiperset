import esbuild from "esbuild"
import fs from "node:fs"
import vm from "node:vm"

type ChacheEntry = { mtime: number, module: Record<string, any> }
declare global { var __hprst_bndlr_cache__: Map<string, ChacheEntry> }
globalThis.__hprst_bndlr_cache__ ??= new Map()
const bundleCache = globalThis.__hprst_bndlr_cache__

export default (entry: string) => {
  const stats = fs.statSync(entry)
  const cached = bundleCache.get(entry)

  if (cached && cached.mtime === stats.mtimeMs) {
    return cached.module
  }

  const result = esbuild.buildSync({
    entryPoints: [entry],
    bundle: true,
    write: false,
    platform: 'node',
    format: 'cjs',        // Mude para CJS para execução síncrona em VM
    target: 'es2024',
    minify: false,        // Minificar é lento e desnecessário para o Linter
    sourcemap: false,        // Desative se não estiver depurando o arquivo .t.ts
    external: ['node:*'],   // Ajuda o esbuild a ignorar coisas que ele não precisa carregar
  })

  const code = result.outputFiles[0]!.text

  try {
    const vmContext = vm.createContext({
      console,
      // require,
      // module,
      __dirname: fs.realpathSync('.'),
      __filename: entry,
      process,
      Buffer,
      setTimeout,
      setImmediate,
      clearImmediate,
      clearTimeout,
    })
    const script = new vm.Script(code, { filename: entry })
    const moduleExports = {}
    const moduleObj = { exports: moduleExports }
    vmContext.module = moduleObj
    script.runInContext(vmContext)
    bundleCache.set(entry, { module: moduleObj.exports, mtime: stats.mtimeMs })
    return moduleObj.exports
  } catch (err) {
    console.error(`Erro ao executar o bundle em VM para o arquivo: ${entry}`)
    throw err
  }
}