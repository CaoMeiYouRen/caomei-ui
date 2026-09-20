#!/usr/bin/env node

/**
 * smoke-runtime：在独立 Node 进程中加载已构建产物，输出 JSON 结果。
 *
 * 由 `check-build.mjs` 以子进程方式调用：
 * 1. 避免与测试运行器的模块转换（Vite import-analysis）互相干扰；
 * 2. 以全新进程加载 `dist/`，更贴近下游真实消费。
 *
 * 信任边界：`root` 由调用方传入（当前仅 `check-build.mjs` 以仓库根传入），
 * 本脚本会 `import` `<root>/dist` 下的代码，因此不可用于不可信路径。
 *
 * 用法（一般无需手动执行）：node scripts/release/smoke-runtime.mjs [rootDir]
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const result = {
    ok: false,
    moduleExports: [],
    resolverFactory: false,
    nuxtModuleFactory: false,
    stylesOk: false,
}

async function importDist(relative) {
    return import(pathToFileURL(join(root, relative)).href)
}

try {
    const runtime = await importDist('dist/index.js')
    result.moduleExports = Object.keys(runtime)

    const resolver = await importDist('dist/resolver.js')
    result.resolverFactory = typeof resolver.CaomeiUiResolver === 'function'

    const nuxtModule = await importDist('dist/nuxt.js')
    result.nuxtModuleFactory = typeof nuxtModule.caomeiUiNuxtModule === 'function'

    const stylesPath = join(root, 'dist/styles/index.css')
    if (existsSync(stylesPath)) {
        const styles = readFileSync(stylesPath, 'utf8')
        result.stylesOk = styles.includes('--caomei-color-primary:') && styles.includes('.caomei-root')
    }

    result.ok = true
} catch (error) {
    result.error = error instanceof Error ? error.message : String(error)
}

process.stdout.write(`${JSON.stringify(result)}\n`)
