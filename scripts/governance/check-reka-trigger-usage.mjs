#!/usr/bin/env node

/**
 * check-reka-trigger-usage：直连 Reka 同型触发器的机检守卫。
 *
 * 为什么需要它：本库为部分 Reka primitive 提供了包装（`CaomeiPopoverTrigger` /
 * `CaomeiDropdownMenuTrigger` / `CaomeiTabTrigger` / `CaomeiStepperTrigger`），包装层承担了类名、
 * ARIA 接线与（如 `panel-idref`）idref 注册等契约。若其它组件在存在包装时**直连 Reka 同型触发器**，
 * 会绕过这些契约、造成行为漂移且无任何现有守卫可感知。
 *
 * 规则（T1~T3）：
 * - T1 `direct-reka-trigger`——受检文件从 `reka-ui` 导入了**已有本库包装**的触发器名，且该文件不是
 *   对应包装文件本身、也未登记进 `ALLOWED_DIRECT_USERS` 时判违规。
 * - T2 `mapping-rot` / `allowlist-rot`——**反向校验**：映射中的包装文件须存在且确实导入其 primitive；
 *   允许名单中的条目须**仍被实际豁免**（否则报错），防止映射 / 豁免腐烂成永久空转。
 * - T3 `scope-narrowed` / 哨兵——受检面文件数与「导入 reka-ui 的文件数」下界 + 哨兵文件身份断言，
 *   防静默收窄。
 *
 * 受检面与误报口径（显式声明）：
 * - 只扫描 `src/components/**` 的 `.vue` / `.ts`（排除 `*.test.ts`）；`docs/**`、`playground/**`、
 *   `scripts/**` 不在面内。
 * - 只对**本库已有包装**的 Reka 触发器施检：`ComboboxTrigger` / `CalendarCellTrigger` /
 *   `DropdownMenuSubTrigger` / `SelectTrigger` / `DialogTrigger` / `AccordionTrigger` 等**无包装**者
 *   不判（属内部实现或尚无包装能力，纳入会造成误报）。
 * - 判定依据是 **`import … from 'reka-ui'` 的具名导入**（模板内使用必先导入；本库不使用全局注册）。
 *   **不在判定面**（已核当前全仓 0 处）：命名空间导入（`import * as R` + `R.PopoverTrigger`）、子路径
 *   导入（`from 'reka-ui/dist/…'`）、经 barrel 再导出 raw 触发器、动态 `import('reka-ui')`。新增这类
 *   写法须同步扩展判定面，否则会静默逃逸。
 *
 * 用法：
 *   node scripts/governance/check-reka-trigger-usage.mjs                 # 受检 src/components；有违规 exit 1
 *   node scripts/governance/check-reka-trigger-usage.mjs --fixture <dir> # 受检面构造测试（跳过下界与哨兵）
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENTS_DIR = join(REPO_ROOT, 'src', 'components')

/**
 * 本库包装 ↔ Reka primitive 映射（`wrapper` 相对 `src/components/`）。
 * 新增包装时同步登记；受 T2 反向校验。
 */
export const WRAPPED_REKA_TRIGGERS = [
    { reka: 'PopoverTrigger', wrapper: 'popover/popover-trigger.vue' },
    { reka: 'DropdownMenuTrigger', wrapper: 'dropdown-menu/dropdown-menu-trigger.vue' },
    { reka: 'TabsTrigger', wrapper: 'tabs/tabs-trigger.vue' },
    { reka: 'StepperTrigger', wrapper: 'stepper/stepper-trigger.vue' },
]

/** 允许直连的例外（`{ reka, file, reason }`）；受 T2 反向校验，条目须仍被实际豁免。 */
export const ALLOWED_DIRECT_USERS = []

/** 受检面下界（防静默收窄）：受检文件数、导入 reka-ui 的文件数（2026-10 基线 197 / 65，取下界留合理裕度）。 */
export const SCOPE_FLOOR = { files: 150, rekaImporters: 40 }

/** 从源码文本抽取 `import { … } from 'reka-ui'` 的具名导入。 */
export function extractRekaImports(text) {
    const names = new Set()
    const importRe = /import\s*\{([^}]*)\}\s*from\s*['"]reka-ui['"]/g
    let match
    while ((match = importRe.exec(text)) !== null) {
        for (const raw of match[1].split(',')) {
            const name = raw.trim().split(/\s+as\s+/)[0].trim()
            if (name) {
                names.add(name)
            }
        }
    }
    return names
}

/**
 * 扫描直连使用。
 * @param {{file: string, text: string}[]} files `file` 为相对 `src/components/` 的路径
 * @returns {{file: string, reka: string, wrapper: string}[]}
 */
export function scanDirectUsage(files, { wrapped = WRAPPED_REKA_TRIGGERS, allowed = ALLOWED_DIRECT_USERS } = {}) {
    const wrapperByReka = new Map(wrapped.map((entry) => [entry.reka, entry.wrapper]))
    const violations = []
    for (const { file, text } of files) {
        for (const name of extractRekaImports(text)) {
            const wrapper = wrapperByReka.get(name)
            if (!wrapper || file === wrapper) {
                continue
            }
            if (allowed.some((entry) => entry.reka === name && entry.file === file)) {
                continue
            }
            violations.push({ file, reka: name, wrapper })
        }
    }
    return violations
}

/** 映射与允许名单的反向校验（T2）。 */
export function findRegistryRot(files, violations, { wrapped = WRAPPED_REKA_TRIGGERS, allowed = ALLOWED_DIRECT_USERS } = {}) {
    const textByFile = new Map(files.map((entry) => [entry.file, entry.text]))
    const issues = []
    for (const entry of wrapped) {
        const text = textByFile.get(entry.wrapper)
        if (text === undefined) {
            issues.push({ code: 'mapping-missing-wrapper', detail: `${entry.reka} 的包装文件不存在：${entry.wrapper}` })
        } else if (!extractRekaImports(text).has(entry.reka)) {
            issues.push({ code: 'mapping-rot', detail: `${entry.wrapper} 未再导入 ${entry.reka}（映射过期？）` })
        }
    }
    for (const entry of allowed) {
        const exempt = violations.some((item) => item.file === entry.file && item.reka === entry.reka)
        if (!exempt) {
            issues.push({ code: 'allowlist-rot', detail: `允许条目未再被实际豁免：${entry.reka} @ ${entry.file}` })
        }
    }
    return issues
}

/** 受检面下界与哨兵（T3）。 */
export function findScopeIssues(files, { wrapped = WRAPPED_REKA_TRIGGERS, floor = SCOPE_FLOOR } = {}) {
    const issues = []
    if (files.length < floor.files) {
        issues.push({ code: 'scope-narrowed', detail: `受检文件数 ${files.length} 低于下界 ${floor.files}` })
    }
    const rekaImporters = files.filter((entry) => extractRekaImports(entry.text).size > 0).length
    if (rekaImporters < floor.rekaImporters) {
        issues.push({ code: 'scope-narrowed', detail: `导入 reka-ui 的文件数 ${rekaImporters} 低于下界 ${floor.rekaImporters}` })
    }
    const present = new Set(files.map((entry) => entry.file))
    for (const entry of wrapped) {
        if (!present.has(entry.wrapper)) {
            issues.push({ code: 'sentinel-missing', detail: `哨兵包装文件不在受检面：${entry.wrapper}` })
        }
    }
    return issues
}

function collectFiles(rootDir) {
    const results = []
    const walk = (dir) => {
        for (const name of readdirSync(dir)) {
            const full = join(dir, name)
            if (statSync(full).isDirectory()) {
                walk(full)
                continue
            }
            if (name.endsWith('.test.ts') || name.endsWith('.test.mjs')) {
                continue
            }
            if (name.endsWith('.vue') || name.endsWith('.ts')) {
                results.push({ file: relative(rootDir, full).split('\\').join('/'), text: readFileSync(full, 'utf8') })
            }
        }
    }
    walk(rootDir)
    return results
}

export function scan(rootDir = COMPONENTS_DIR, { enforceScope = true } = {}) {
    const files = collectFiles(rootDir)
    const violations = scanDirectUsage(files)
    const registry = findRegistryRot(files, violations)
    const scope = enforceScope ? findScopeIssues(files) : []
    return { files, violations, registry, scope }
}

export function main(argv = process.argv.slice(2)) {
    const fixtureIndex = argv.indexOf('--fixture')
    let rootDir = COMPONENTS_DIR
    let enforceScope = true
    if (fixtureIndex !== -1) {
        const target = argv[fixtureIndex + 1]
        if (!target) {
            console.error('[check-reka-trigger-usage] --fixture 需要目录参数')
            return 2
        }
        rootDir = resolve(target)
        enforceScope = false
        if (!existsSync(rootDir)) {
            console.error(`[check-reka-trigger-usage] --fixture 目录不存在：${rootDir}`)
            return 2
        }
        console.warn(`[check-reka-trigger-usage][warn] 受检面构造模式（跳过下界与哨兵）：${rootDir}——仅限本地测试，禁止接入 CI / governance:check`)
    } else if (argv.length > 0) {
        console.error(`[check-reka-trigger-usage] 不支持的参数：${argv.join(' ')}`)
        return 2
    }

    const { files, violations, registry, scope } = scan(rootDir, { enforceScope })
    const issues = [
        ...violations.map((item) => ({ code: 'direct-reka-trigger', detail: `${item.file} 直连了 ${item.reka}（应改用本库包装 ${item.wrapper}）` })),
        ...registry,
        ...scope,
    ]
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-reka-trigger-usage][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-reka-trigger-usage] ${issues.length} 处问题（受检 ${files.length} 文件）`)
        return 1
    }
    console.info(`[check-reka-trigger-usage] OK：直连 Reka 同型触发器 0 处（受检 ${files.length} 文件）`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
