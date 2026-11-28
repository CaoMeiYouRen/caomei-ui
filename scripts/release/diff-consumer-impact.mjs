#!/usr/bin/env node

/**
 * diff-consumer-impact：版本升级的**消费方可见变化**清单（发布前人工复核的输入）。
 *
 * 与 `diff-api.mjs` 的分工（刻意不合并、也不扩展它）：
 * - `diff-api` 只做 `.d.ts` 的**破坏性判定**（删除 / 重命名 / required 收紧），出口是退出码；
 * - 本脚本做**消费方视角的变化清单**，出口是 JSON：公共 props（含默认值）/ events / slots、
 *   DOM 关键类名（`caomei-*`）、`--caomei-*` 变量，逐项列出新增 / 删除 / 变更。
 *
 * 数据来源分三层，均为「源码树」而非产物：
 * 1. props / events / slots：复用 `scripts/docs/gen-component-meta.mjs` 的
 *    `collectComponentMeta(root)`（vue-component-meta 从 SFC 抽取，**含默认值**——这是 `.d.ts`
 *    拿不到的部分）；
 * 2. `--caomei-*` 变量与 `caomei-*` 类名：扫描 `src/**` 下的 `.css` / `.scss` / `.vue`。
 *
 * 输入是两棵**源码树**（`<root>/src` + `<root>/tsconfig.json`）：基线一般由上一发布 tag 抽取
 * （`extractSourceTreeFromGit`），当前即工作区。
 *
 * 用法：
 *   node scripts/release/diff-consumer-impact.mjs \
 *       --baseline=<dir> --current=.            # 打印 JSON（stdout）
 *   node scripts/release/diff-consumer-impact.mjs ... --fail-on-breaking   # 有 breaking 时 exit 1
 *
 * 退出码：0 成功（默认即使有变化也返回 0，清单本身不是门禁）；1 `--fail-on-breaking` 下存在
 * breaking；2 参数或路径错误。
 *
 * 立场：**本脚本不改判定档位**。新增 / 删除各有语义，是否由此阻断发布仍交人工复核
 * （清单进 `docs/guide/release.md` §10.1 的升级复核流程）。
 */
import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'
import { collectComponentMeta } from '../docs/gen-component-meta.mjs'

export const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 参与扫描的源码扩展名（变量与类名面）。 */
const STYLE_EXTENSIONS = ['.css', '.scss', '.vue']
/** 组件 meta 抽取的目录（相对源码树根）。 */
const COMPONENTS_DIR = join('src', 'components')

const CSS_VARIABLE_RE = /--caomei-[a-z0-9-]+(?=\s*:)/gu
// BEM 片段含 `__` / `--` / 单字母，故字符集须包含下划线
const CLASS_NAME_RE = /\.caomei-[a-z0-9_-]+/gu

/**
 * 递归收集源码树下的样式 / 组件文件。
 *
 * @param {string} root 源码树根
 * @returns {string[]} 绝对路径（排序）
 */
export function collectStyleFiles(root) {
    const files = []
    const walk = (dir) => {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
            const full = join(dir, entry.name)
            if (entry.isDirectory()) {
                walk(full)
            } else if (entry.isFile() && STYLE_EXTENSIONS.some((extension) => entry.name.endsWith(extension))) {
                files.push(full)
            }
        }
    }
    if (existsSync(join(root, 'src'))) {
        walk(join(root, 'src'))
    }
    return files.sort()
}

/**
 * 扫描源码树的样式面：`--caomei-*` 变量声明与 `.caomei-*` 类名。
 *
 * @param {string} root 源码树根
 * @returns {{ tokens: string[], classNames: string[] }} 各自去重并排序
 */
export function collectStyleSurface(root) {
    const tokens = new Set()
    const classNames = new Set()
    for (const file of collectStyleFiles(root)) {
        const text = readFileSync(file, 'utf8')
        for (const match of text.matchAll(CSS_VARIABLE_RE)) {
            tokens.add(match[0])
        }
        for (const match of text.matchAll(CLASS_NAME_RE)) {
            classNames.add(match[0])
        }
    }
    return { tokens: [...tokens].sort(), classNames: [...classNames].sort() }
}

/**
 * 抽取一棵源码树的消费方可见面。
 *
 * @param {string} root 源码树根
 * @returns {{
 *   components: Record<string, { props: Array<{ name: string, type: string, default: string | null, required: boolean }>, events: string[], slots: string[] }>,
 *   tokens: string[],
 *   classNames: string[],
 * }}
 */
export function collectConsumerSurface(root) {
    const meta = collectComponentMeta(root)
    const components = {}
    for (const [name, value] of Object.entries(meta)) {
        components[name] = {
            props: (value.props ?? []).map((prop) => ({
                name: prop.name,
                type: prop.type,
                default: prop.default ?? null,
                required: prop.required === true,
            })),
            events: (value.events ?? []).map((event) => event.name).sort(),
            slots: (value.slots ?? []).map((slot) => slot.name).sort(),
        }
    }

    const { tokens, classNames } = collectStyleSurface(root)
    return { components, tokens, classNames }
}

/** 集合差：`right` 相对 `left` 的新增与删除。 */
function compareSets(left, right) {
    const leftSet = new Set(left)
    const rightSet = new Set(right)
    return {
        added: [...rightSet].filter((item) => !leftSet.has(item)).sort(),
        removed: [...leftSet].filter((item) => !rightSet.has(item)).sort(),
    }
}

/**
 * 比较两份 surface，产出消费方可见变化清单（JSON 可序列化）。
 *
 * @param {ReturnType<typeof collectConsumerSurface>} baseline 基线面
 * @param {ReturnType<typeof collectConsumerSurface>} current 当前面
 */
export function diffSurfaces(baseline, current) {
    const componentNames = {
        added: Object.keys(current.components).filter((name) => !(name in baseline.components)).sort(),
        removed: Object.keys(baseline.components).filter((name) => !(name in current.components)).sort(),
    }

    const props = { added: [], removed: [], changed: [] }
    const events = { added: [], removed: [] }
    const slots = { added: [], removed: [] }

    const shared = Object.keys(baseline.components).filter((name) => name in current.components)
    for (const name of shared) {
        const before = baseline.components[name]
        const after = current.components[name]
        const beforeProps = new Map(before.props.map((prop) => [prop.name, prop]))
        const afterProps = new Map(after.props.map((prop) => [prop.name, prop]))

        for (const [propName, prop] of afterProps) {
            const previous = beforeProps.get(propName)
            if (!previous) {
                props.added.push(`${name}#${propName}`)
                continue
            }
            if (previous.default !== prop.default) {
                props.changed.push({ key: `${name}#${propName}`, change: 'default', before: previous.default, after: prop.default })
            }
            if (previous.type !== prop.type) {
                props.changed.push({ key: `${name}#${propName}`, change: 'type', before: previous.type, after: prop.type })
            }
            if (previous.required !== prop.required) {
                props.changed.push({ key: `${name}#${propName}`, change: 'required', before: previous.required, after: prop.required })
            }
        }
        for (const propName of beforeProps.keys()) {
            if (!afterProps.has(propName)) {
                props.removed.push(`${name}#${propName}`)
            }
        }

        const eventDiff = compareSets(before.events, after.events)
        events.added.push(...eventDiff.added.map((item) => `${name}#${item}`))
        events.removed.push(...eventDiff.removed.map((item) => `${name}#${item}`))

        const slotDiff = compareSets(before.slots, after.slots)
        slots.added.push(...slotDiff.added.map((item) => `${name}#${item}`))
        slots.removed.push(...slotDiff.removed.map((item) => `${name}#${item}`))
    }

    const tokens = compareSets(baseline.tokens, current.tokens)
    const classNames = compareSets(baseline.classNames, current.classNames)

    const breaking = componentNames.removed.length
        + props.removed.length
        + events.removed.length
        + slots.removed.length
        + tokens.removed.length
        + classNames.removed.length
        + props.changed.filter((item) => item.change === 'required' && item.after === true).length
    const additive = componentNames.added.length + props.added.length + events.added.length + slots.added.length
    const changed = props.changed.length

    return {
        components: componentNames,
        props,
        events: { added: events.added.sort(), removed: events.removed.sort() },
        slots: { added: slots.added.sort(), removed: slots.removed.sort() },
        tokens: { added: tokens.added, removed: tokens.removed },
        classNames: { added: classNames.added, removed: classNames.removed },
        summary: { breaking, additive, changed },
    }
}

/**
 * 从 git 引出一个 tag / ref 的源码树到目标目录（发布复核的基线来源）。
 *
 * @param {string} ref tag / commit
 * @param {string} destDir 目标目录（须已存在）
 * @param {string} root 仓库根
 */
export function extractSourceTreeFromGit(ref, destDir, root = REPO_ROOT) {
    const archive = spawnSync('git', ['archive', '--format=tar', ref, 'src', 'tsconfig.json'], {
        cwd: root,
        maxBuffer: 256 * 1024 * 1024,
    })
    if (archive.status !== 0) {
        throw new Error(`git archive ${ref} 失败：${archive.stderr?.toString() ?? ''}`)
    }
    const extract = spawnSync('tar', ['-x', '-C', destDir], { input: archive.stdout })
    if (extract.status !== 0) {
        throw new Error(`解包 ${ref} 失败：${extract.stderr?.toString() ?? ''}`)
    }
}

/** 断言目录是可用的源码树。 */
function assertSourceRoot(root, label) {
    const src = join(root, 'src')
    const tsconfig = join(root, 'tsconfig.json')
    if (!existsSync(src) || !existsSync(join(src, 'components'))) {
        throw new Error(`${label} 不是源码树：缺少 ${join(root, 'src', 'components')}`)
    }
    if (!existsSync(tsconfig)) {
        throw new Error(`${label} 不是源码树：缺少 ${tsconfig}`)
    }
}

/**
 * CLI 入口。
 *
 * @param {string[]} argv 参数（不含 node / 脚本名）
 * @returns {number} 退出码
 */
export function main(argv = process.argv) {
    let options
    try {
        options = parseCliOptions(argv, {
            defaults: { current: REPO_ROOT, failOnBreaking: false },
            flags: { '--fail-on-breaking': { key: 'failOnBreaking' } },
            values: {
                '--baseline': { key: 'baseline' },
                '--current': { key: 'current' },
            },
        })
    } catch (error) {
        console.error(`[diff-consumer-impact] 参数错误：${error.message}`)
        return 2
    }

    if (!options.baseline) {
        console.error('[diff-consumer-impact] 缺少 --baseline=<dir>（基线源码树）')
        return 2
    }

    // 必须是绝对路径：vue-component-meta 以 tsconfig 所在目录为 program 根，相对路径会让
    // 组件文件被判为「不属于 project」
    const baselineRoot = resolve(options.baseline)
    const currentRoot = resolve(options.current)

    try {
        assertSourceRoot(baselineRoot, '--baseline')
        assertSourceRoot(currentRoot, '--current')
    } catch (error) {
        console.error(`[diff-consumer-impact] ${error.message}`)
        return 2
    }

    let report
    try {
        report = diffSurfaces(
            collectConsumerSurface(baselineRoot),
            collectConsumerSurface(currentRoot),
        )
    } catch (error) {
        console.error(`[diff-consumer-impact] 抽取失败：${error.message}`)
        return 2
    }
    console.info(JSON.stringify(report, null, 2))

    if (options.failOnBreaking && report.summary.breaking > 0) {
        console.error(`[diff-consumer-impact] 存在 ${report.summary.breaking} 项消费方可见的删除 / 收紧`)
        return 1
    }
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
