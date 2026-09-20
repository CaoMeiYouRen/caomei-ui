#!/usr/bin/env node

/**
 * check-resolver：resolver 消费路径冒烟（运行器）。
 *
 * 依据 unplugin-vue-components 的 resolver 契约，用 `dist/resolver.js` 的**实际返回值**
 * （`from` + `sideEffects`）驱动一个最小 Vite 构建。该路径下打包器会丢弃
 * `dist/index.js` 自带的基线层 CSS import（实测），故基础层能否出现**取决于本 resolver 的
 * `sideEffects`**——这正是本脚本的判别点。断言：
 * 1. 基础层（tokens / `.caomei-root`）生效且只注入一份（计数由基础层文件实测派生）；
 * 2. 被引入组件的样式在，**未引入组件的样式不在**（按需生效，防止 tree-shaking 退化）。
 *
 * 纯函数在 `check-resolver.mjs`（须静态 import，见其文件头）；本文件含动态 import，
 * **不供 vitest 导入**。
 *
 * 用法：`pnpm build && node scripts/release/check-resolver.run.mjs`
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import { PROBE_COMPONENTS, expectedBaseLayerTokenCount, renderEntry, verifyProducedCss } from './check-resolver.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 需要链接进 fixture 的包（`caomei-ui` 指向仓库根，其余复用仓库内已安装版本）。 */
const LINKED_PACKAGES = ['vue', 'reka-ui', '@lucide/vue', '@tanstack/vue-table', '@internationalized/date']

/** 建立 fixture 的 node_modules 链接（幂等）。 */
function ensureLinks(fixtureDir) {
    const modulesDir = join(fixtureDir, 'node_modules')
    mkdirSync(modulesDir, { recursive: true })
    for (const name of ['caomei-ui', ...LINKED_PACKAGES]) {
        const source = name === 'caomei-ui' ? REPO_ROOT : join(REPO_ROOT, 'node_modules', name)
        if (!(name === 'caomei-ui' || existsSync(source))) {
            continue
        }
        const linkPath = join(modulesDir, name)
        mkdirSync(dirname(linkPath), { recursive: true })
        try {
            symlinkSync(source, linkPath, 'dir')
        } catch (error) {
            if (error?.code !== 'EEXIST') {
                throw error
            }
        }
    }
}

/** 执行 resolver 冒烟，返回 `{ ok, errors, details }`。 */
export async function checkResolver(root = REPO_ROOT) {
    const errors = []
    const resolverPath = join(root, 'dist', 'resolver.js')
    if (!existsSync(resolverPath)) {
        return { ok: false, errors: ['dist/resolver.js 不存在，请先执行 `pnpm build`'], details: {} }
    }

    const { CaomeiUiResolver } = await import(pathToFileURL(resolverPath).href)
    const resolver = CaomeiUiResolver()
    const resolved = PROBE_COMPONENTS.map((name) => resolver.resolve(name))
    const missing = PROBE_COMPONENTS.filter((_, index) => !resolved[index])
    if (missing.length > 0) {
        errors.push(`resolver 未解析组件：${missing.join(', ')}`)
        return { ok: false, errors, details: { resolved } }
    }

    const fixtureDir = join(root, '.temp', 'check-resolver')
    rmSync(fixtureDir, { recursive: true, force: true })
    mkdirSync(fixtureDir, { recursive: true })
    ensureLinks(fixtureDir)
    const entryFile = join(fixtureDir, 'entry.ts')
    writeFileSync(entryFile, renderEntry(resolved))
    writeFileSync(
        join(fixtureDir, 'package.json'),
        JSON.stringify({ name: 'caomei-resolver-probe', private: true, type: 'module' }, null, 4),
    )

    const { build } = await import('vite')
    const outDir = join(fixtureDir, 'out')
    await build({
        root: fixtureDir,
        logLevel: 'silent',
        configFile: false,
        build: {
            outDir,
            emptyOutDir: true,
            cssCodeSplit: false,
            minify: true,
            rollupOptions: {
                input: entryFile,
                output: { entryFileNames: 'entry.js', chunkFileNames: 'chunk-[name].js', assetFileNames: '[name][extname]' },
            },
        },
    })

    const cssFiles = readdirSync(outDir).filter((file) => file.endsWith('.css'))
    if (cssFiles.length === 0) {
        errors.push('构建未产出 CSS 文件')
        return { ok: false, errors, details: { resolved } }
    }
    const css = cssFiles.map((file) => readFileSync(join(outDir, file), 'utf8')).join('\n')
    const verdict = verifyProducedCss(css, expectedBaseLayerTokenCount(root))
    errors.push(...verdict.errors)

    return {
        ok: errors.length === 0,
        errors,
        details: { resolved, cssFiles, cssBytes: css.length },
    }
}

if (isDirectExecution(import.meta.url)) {
    // 不用顶层 await：脚本可能被工具链加载，顶层 await 会触发 Vite 的 SSR 转换路径。
    checkResolver()
        .then((result) => {
            if (result.ok) {
                console.info(
                    `[check-resolver] 通过：resolver 注入生效（组件样式 + 基础层各一份，只取 ${PROBE_COMPONENTS.join(' / ')}）`,
                )
                return
            }
            for (const error of result.errors) {
                console.error(`[check-resolver][error] ${error}`)
            }
            process.exitCode = 1
        })
        .catch((error) => {
            console.error(`[check-resolver][error] ${error instanceof Error ? error.message : String(error)}`)
            process.exitCode = 1
        })
}
