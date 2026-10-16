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
import { MIN_SUBPATH_LOCALES, SUBPATH_EXPORT_PREFIX } from '../governance/check-locale-keys.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 运行时入口必须存在的关键公共导出。 */
export const REQUIRED_RUNTIME_EXPORTS = [
    'CaomeiButton',
    'CaomeiInput',
    'CaomeiSelect',
    'CaomeiDialog',
    'CaomeiChart',
    'CaomeiDataTable',
    'CaomeiRichTextEditor',
    'caomeiLocales',
    'useConfirm',
    'useTheme',
    'useToast',
    'useLocaleCode',
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

/**
 * 语言子路径导出的产物校验（按需引入形态的承重断言）。
 *
 * 五条不变量：
 * 1. `exports` 中 `./locale/<code>` 的数量不得低于下界（防按需引入能力被静默移除）；
 * 2. 每条子路径的**产物目标与语言标识同源**（防「按 A 的路径拿到 B 的文案」而按键名判定的检查全绿）；
 * 3. 每个子路径产物存在且**带默认导出**（消费方以 `import messages from 'caomei-ui/locale/<code>'` 取用）；
 * 4. **注册表产物不得静态引入按需语言**（`dist/locale/index.js` 出现真实的 `./<code>.js` 引入即意味着
 *    按需语言被重新拉回主包，按需引入的体积收益归零——此断言是该形态的核心承重面；按**语句级**匹配，
 *    注释中的示例代码不算引入）；
 * 5. **无孤儿语言产物**：`dist/locale/` 下不得存在既未被注册表引入、也未登记为子路径导出的语言产物。
 *
 * 边界：③ / ⑤ 硬依赖构建器当前的 emit 形态（双引号 + 显式 `.js` 扩展名）；构建器升级时须一并复核。
 *
 * @param {string} root 仓库根
 * @param {number} minSubpaths 语言子路径导出的最低数量
 * @returns {string[]} 问题列表（空数组表示通过）
 */
export function findLocaleSubpathProblems(root, minSubpaths = MIN_SUBPATH_LOCALES, pkg) {
    const problems = []
    const manifest = pkg ?? JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
    const exportsField = manifest.exports ?? {}
    const codes = Object.keys(exportsField)
        .filter((key) => key.startsWith(SUBPATH_EXPORT_PREFIX))
        .map((key) => key.slice(SUBPATH_EXPORT_PREFIX.length))
        .sort()

    if (codes.length < minSubpaths) {
        problems.push(`语言子路径导出数量不足：${codes.length} < ${minSubpaths}（按需引入能力是否被移除？）`)
    }

    // 声明面同源：`./locale/<code>` 的产物目标必须是同名语言产物，
    // 否则下游会「按 A 语言的路径拿到 B 语言的文案」，而按键名判定的检查全绿。
    for (const code of codes) {
        const targets = collectExportFiles(exportsField[`${SUBPATH_EXPORT_PREFIX}${code}`])
        const expected = `./dist/locale/${code}.js`
        if (!targets.includes(expected)) {
            problems.push(
                `语言子路径 ${SUBPATH_EXPORT_PREFIX}${code} 的产物目标与语言标识不同源：`
                + `期望 ${expected}，实际 ${targets.filter((file) => file.endsWith('.js')).join(' / ') || '（无）'}`,
            )
        }
    }

    const registryPath = join(root, 'dist', 'locale', 'index.js')
    const registrySource = existsSync(registryPath) ? readFileSync(registryPath, 'utf8') : ''

    for (const code of codes) {
        const file = join(root, 'dist', 'locale', `${code}.js`)
        if (!existsSync(file)) {
            problems.push(`语言子路径产物缺失：dist/locale/${code}.js`)
            continue
        }
        const source = readFileSync(file, 'utf8')
        if (!/export\s*\{\s*[\w$]+\s+as\s+default\s*\}/.test(source)) {
            problems.push(`语言子路径产物缺少默认导出：dist/locale/${code}.js`)
        }
        // 语句级匹配（非裸 `includes`）：注释中的示例代码不得被判为真实引入；
        // 亦不剥离注释——产物为双引号，`stripComments` 只识别单引号会引入新假阴性。
        // 边界：仅匹配 `./<code>.js` 字面形态（`"./ja-jp"` / 自引用等形态由 runtime smoke 兜底，
        // 见 JSDoc）。
        const importRe = new RegExp(`^\\s*(?:import|export)\\b[^\\n]*["']\\./${code}\\.js["']`, 'm')
        if (importRe.test(registrySource)) {
            problems.push(
                `注册表静态引入了按需语言 dist/locale/${code}.js：`
                + '按需引入的产物体积收益失效（非预注册语言不得进入包根依赖图）',
            )
        }
    }

    // 反向断言：产物目录不得存在「既非预注册、又无子路径登记」的孤儿语言产物
    // （孤儿产物意味着守卫清单与真实产物脱节）。
    const localeDir = join(root, 'dist', 'locale')
    if (existsSync(localeDir)) {
        // 与 ③ 同一语句级口径：仅统计真实的 import / export 语句（注释中的路径不算注册，
        // 否则会漏判孤儿产物——fail-open）。
        const registered = new Set(
            [...registrySource.matchAll(/^\s*(?:import|export)\b[^\n]*["']\.\/([a-z-]+)\.js["']/gm)]
                .map((match) => match[1]),
        )
        for (const file of readdirSync(localeDir)) {
            if (!file.endsWith('.js') || file === 'index.js') {
                continue
            }
            const code = file.slice(0, -3)
            if (!registered.has(code) && !codes.includes(code)) {
                problems.push(
                    `孤儿语言产物 dist/locale/${file}：既未被注册表引入、也未登记为子路径导出`,
                )
            }
        }
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

    // 语言子路径（按需引入形态）的承重断言：见 findLocaleSubpathProblems 的说明。
    if (missing.length === 0 && empty.length === 0) {
        const localeProblems = findLocaleSubpathProblems(root, MIN_SUBPATH_LOCALES, pkg)
        details.localeSubpathProblems = localeProblems
        errors.push(...localeProblems)
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
            `[check-build] 通过：${result.details.exportFiles.length} 个 exports 产物齐全，index / resolver / nuxt 入口可加载，语言子路径与导出目标同源且未被注册表静态引入`,
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
