#!/usr/bin/env node

/**
 * 计算样式快照比对运行器：逐键逐属性比较两份采样 JSON。
 *
 * 纯函数（`diffEntries` / `formatDiffs`）供 `capture.test.mjs` 直接导入；CLI 入口用于
 * 手工比较任意两份快照（如 `CAOMEI_SRC` 指向 `HEAD` worktree 采出的改动前基线）。
 *
 * 用法：
 *   node test/capture/diff.mjs                                  # 冻结基线 vs 最新采集快照
 *   node test/capture/diff.mjs <基线.json> <快照.json>            # 指定两份快照
 *
 * 差异即视为回归：任一键仅存在于单侧（采样面被收窄 / 新增）或任一属性取值不同都会列出并以 exit 1 结束。
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../../scripts/shared/cli.mjs'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** 冻结基线：由 `capture.mjs --freeze` 生成并随装置同提交。 */
export const DEFAULT_BASELINE_FILE = path.join(dirname, 'baseline.json')
/** 最新采集快照：gitignored 的临时产物，仅作比对输入。 */
export const DEFAULT_SNAPSHOT_FILE = path.resolve(dirname, '..', '..', '.temp', 'computed-styles', 'current.json')

/** 选择器未命中时 `capture.mjs` 写入的占位结构。 */
const MISSING_KEY = '__missing'

function isMissing(value) {
    return typeof value === 'object' && value !== null && MISSING_KEY in value
}

/**
 * 逐键逐属性比对两份 `entries`。
 *
 * @param {Record<string, Record<string, string>>} baseline 基线快照的 entries
 * @param {Record<string, Record<string, string>>} current 待比对快照的 entries
 * @returns {Array<{ key: string, prop: string, baseline: string, current: string, note?: string }>} 差异清单（空数组 = 一致）
 */
export function diffEntries(baseline, current) {
    const diffs = []
    const keys = [...new Set([...Object.keys(baseline), ...Object.keys(current)])].sort()

    for (const key of keys) {
        const base = baseline[key]
        const next = current[key]

        if (base === undefined) {
            diffs.push({ key, prop: '*', baseline: '(缺失)', current: '(新增)', note: '键仅存在于当前快照' })
            continue
        }
        if (next === undefined) {
            diffs.push({ key, prop: '*', baseline: '(存在)', current: '(缺失)', note: '键仅存在于基线（受检面被收窄？）' })
            continue
        }
        if (isMissing(base) || isMissing(next)) {
            diffs.push({
                key,
                prop: MISSING_KEY,
                baseline: isMissing(base) ? `未命中 ${base[MISSING_KEY]}` : '(命中)',
                current: isMissing(next) ? `未命中 ${next[MISSING_KEY]}` : '(命中)',
                note: '选择器未命中',
            })
            continue
        }

        for (const prop of [...new Set([...Object.keys(base), ...Object.keys(next)])].sort()) {
            if (base[prop] !== next[prop]) {
                diffs.push({ key, prop, baseline: base[prop] ?? '(无)', current: next[prop] ?? '(无)' })
            }
        }
    }

    return diffs
}

/**
 * 把差异清单格式化为逐行文本。
 *
 * @param {Array<{ key: string, prop: string, baseline: string, current: string, note?: string }>} diffs 差异清单
 * @returns {string[]} 每个差异一行
 */
export function formatDiffs(diffs) {
    return diffs.map((item) => `  ${item.key} | ${item.prop} | 基线=${item.baseline} | 当前=${item.current}${item.note ? ` (${item.note})` : ''}`)
}

/** 读取快照文件并返回其 entries；文件缺失时抛错（不静默跳过）。 */
export function readEntries(file) {
    const payload = JSON.parse(readFileSync(file, 'utf8'))
    if (typeof payload?.entries !== 'object' || payload.entries === null) {
        throw new Error(`快照缺少 entries 字段：${file}`)
    }
    return payload.entries
}

export function main(argv = process.argv.slice(2)) {
    const [baselineFile = DEFAULT_BASELINE_FILE, snapshotFile = DEFAULT_SNAPSHOT_FILE] = argv
    const baseline = readEntries(baselineFile)
    const current = readEntries(snapshotFile)
    const diffs = diffEntries(baseline, current)

    if (diffs.length === 0) {
        console.info(`[capture:diff] 0 差异：${Object.keys(baseline).length} 项逐属性一致`)
        return 0
    }

    console.error(`[capture:diff] ${diffs.length} 处差异（基线 ${baselineFile} → 当前 ${snapshotFile}）：`)
    for (const line of formatDiffs(diffs)) {
        console.error(line)
    }
    return 1
}

if (isDirectExecution(import.meta.url)) {
    try {
        process.exitCode = main()
    } catch (error) {
        console.error(`[capture:diff][error] ${error instanceof Error ? error.message : String(error)}`)
        process.exitCode = 1
    }
}
