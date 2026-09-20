#!/usr/bin/env node

/**
 * check-build：构建产物冒烟校验。
 *
 * 对应测试规范「公共 API / 导出 / 构建配置 → 产物冒烟」的最低验证要求，
 * 用于本地 link 联调前确认 `dist/` 产物可被消费。
 *
 * 校验项：
 * 1. `package.json` 的 `exports` 声明的每个产物文件存在且非空；
 * 2. 运行时入口 `dist/index.js` 在独立 Node 进程中可加载，且关键公共导出齐全；
 * 3. `dist/resolver.js`、`dist/nuxt.js` 可加载并导出对应工厂；
 * 4. 基础层 `dist/styles/index.css` 含主题 token 与根类选择器。
 *
 * 用法：
 *   pnpm build && node scripts/release/check-build.mjs
 *
 * 本脚本校验**已构建产物**，存在运行顺序依赖，故单测只覆盖其中的纯函数。
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 运行时入口必须存在的关键公共导出。 */
export const REQUIRED_RUNTIME_EXPORTS = [
    'CaomeiButton',
    'CaomeiInput',
    'CaomeiSelect',
    'CaomeiDialog',
    'CaomeiDataTable',
    'caomeiLocales',
    'useConfirm',
    'useTheme',
    'useToast',
]

/** 递归收集 `exports` 中声明的全部产物文件路径（去重并排序）。 */
export function collectExportFiles(exportsField) {
    const files = new Set()

    const walk = (value) => {
        if (typeof value === 'string') {
            files.add(value)
            return
        }
        if (Array.isArray(value)) {
            for (const item of value) {
                walk(item)
            }
            return
        }
        if (value && typeof value === 'object') {
            for (const item of Object.values(value)) {
                walk(item)
            }
        }
    }

    walk(exportsField)
    return [...files].sort()
}

/** 检查产物文件是否存在且非空，返回缺失与空文件列表。 */
export function findInvalidFiles(root, files) {
    const missing = []
    const empty = []

    for (const file of files) {
        const absolute = join(root, file)
        if (!existsSync(absolute)) {
            missing.push(file)
            continue
        }
        if (statSync(absolute).size === 0) {
            empty.push(file)
        }
    }

    return { missing, empty }
}

/** 从实际导出名中筛出缺失的关键导出名。 */
export function findMissingExports(exportNames, required = REQUIRED_RUNTIME_EXPORTS) {
    const present = new Set(exportNames)
    return required.filter((name) => !present.has(name))
}

/** 在独立 Node 进程中加载产物，返回冒烟结果（取最后一行 JSON，避免被其他 stdout 干扰）。 */
export function runRuntimeSmoke(root = REPO_ROOT) {
    const here = dirname(fileURLToPath(import.meta.url))
    const script = join(here, 'smoke-runtime.mjs')
    // 产物按 `css.inject` 携带 CSS import，裸 Node 无法加载 `.css`；
    // 冒烟只校验 JS 导出面，故用 loader 把 CSS 请求短路为空模块。
    const register = join(here, 'register-css-stub.mjs')
    const stdout = execFileSync(process.execPath, ['--import', register, script, root], { encoding: 'utf8' })
    const lastLine = stdout.trim().split('\n').filter(Boolean).at(-1)
    if (!lastLine) {
        throw new Error('smoke-runtime 未输出结果')
    }
    return JSON.parse(lastLine)
}

/**
 * 断言产物 JS 仍保留 CSS import。
 *
 * `css.inject` 是本形态的承重机制（组件样式随模块按需取用、基础层经 `theme.css` 注入），
 * 而冒烟用的 loader 会把 `.css` 请求短路为空模块——若不另设正向断言，
 * 「产物丢失 CSS import」将不会被任何门禁发现。
 *
 * @param {string} root 仓库根
 * @param {number} minComponentCssImports 组件级 CSS import 的最低数量
 * @returns {string[]} 问题列表（空数组表示通过）
 */
export function findMissingCssImports(root, minComponentCssImports = 1) {
    const problems = []
    const entryFile = join(root, 'dist', 'index.js')
    if (existsSync(entryFile) && !readFileSync(entryFile, 'utf8').includes('.css"')) {
        problems.push('dist/index.js 未保留 CSS import（css.inject 未生效？）')
    }

    const componentsDir = join(root, 'dist', 'components')
    let componentCssImports = 0
    if (existsSync(componentsDir)) {
        for (const dir of readdirSync(componentsDir)) {
            const dirPath = join(componentsDir, dir)
            if (!statSync(dirPath).isDirectory()) {
                continue
            }
            for (const file of readdirSync(dirPath)) {
                if (file.endsWith('.js') && readFileSync(join(dirPath, file), 'utf8').includes('.css"')) {
                    componentCssImports++
                }
            }
        }
    }
    if (componentCssImports < minComponentCssImports) {
        problems.push(`组件级 CSS import 数量不足：${componentCssImports} < ${minComponentCssImports}`)
    }
    return problems
}

/** 执行全部产物冒烟校验，返回 `{ ok, errors, details }`。 */
export function checkBuild(root = REPO_ROOT) {
    const errors = []
    const details = {}

    const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    const exportFiles = collectExportFiles(pkg.exports)
    details.exportFiles = exportFiles

    const { missing, empty } = findInvalidFiles(root, exportFiles)
    details.needsBuild = missing.some((file) => file.startsWith('./dist/'))
    for (const file of missing) {
        errors.push(`exports 声明的产物缺失：${file}`)
    }
    for (const file of empty) {
        errors.push(`产物文件为空：${file}`)
    }

    // 承重机制正向断言：产物 JS 必须保留 CSS import（见 findMissingCssImports 的说明）。
    const cssImportProblems = findMissingCssImports(root)
    details.cssImportProblems = cssImportProblems
    if (missing.length === 0 && empty.length === 0) {
        errors.push(...cssImportProblems)
    }

    if (missing.length === 0 && empty.length === 0) {
        try {
            const runtime = runRuntimeSmoke(root)
            if (!runtime.ok) {
                errors.push(`产物运行时加载失败：${runtime.error ?? '未知错误'}`)
            } else {
                for (const name of findMissingExports(runtime.moduleExports)) {
                    errors.push(`dist/index.js 缺少公共导出：${name}`)
                }
                if (!runtime.resolverFactory) {
                    errors.push('dist/resolver.js 未导出 CaomeiUiResolver 工厂')
                }
                if (!runtime.nuxtModuleFactory) {
                    errors.push('dist/nuxt.js 未导出 caomeiUiNuxtModule 工厂')
                }
                if (!runtime.stylesOk) {
                    errors.push('基础层 dist/styles/index.css 缺少主题 token 或 .caomei-root 根类')
                }
            }
        } catch (error) {
            errors.push(`产物运行时冒烟执行失败：${error instanceof Error ? error.message : String(error)}`)
        }
    }

    return { ok: errors.length === 0, errors, details }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkBuild()

    if (result.ok) {
        console.info(
            `[check-build] 通过：${result.details.exportFiles.length} 个 exports 产物齐全，index / resolver / nuxt 入口可加载`,
        )
        process.exit(0)
    }

    if (result.details.needsBuild) {
        console.error('[check-build][hint] 检测到 dist 产物缺失，请先执行 `pnpm build`')
    }
    for (const error of result.errors) {
        console.error(`[check-build][error] ${error}`)
    }
    process.exit(1)
}
