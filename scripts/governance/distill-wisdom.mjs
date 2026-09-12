#!/usr/bin/env node

/**
 * distill-wisdom：统计 `.session/wisdom.md` 活跃条目数，辅助 Session Wisdom 蒸馏决策。
 *
 * 活跃条目格式（权威定义见 docs/design/governance/session-wisdom-distillation.md）：
 * - 顶层 bullet：`- [YYYY-MM-DD] [type] 摘要`（缩进的子 bullet 不计入）；
 * - 兼容无 bullet 的迁移摘要行：`[YYYY-MM-DD] [type] 摘要 → docs/path`。
 *
 * 用法：
 *   node scripts/governance/distill-wisdom.mjs                       # 输出统计报告
 *   node scripts/governance/distill-wisdom.mjs --check               # 仅输出阈值结论（退出码恒为 0）
 *   node scripts/governance/distill-wisdom.mjs --threshold=15
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getArgValue, hasFlag, isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_THRESHOLD = 20

const BULLET_ENTRY_RE = /^-\s+/
const BARE_ENTRY_RE = /^\[\d{4}-\d{2}-\d{2}\]/

/** 是否为一条活跃条目行（顶层 bullet 或迁移摘要行）。 */
export function isActiveEntryLine(line) {
    return BULLET_ENTRY_RE.test(line) || BARE_ENTRY_RE.test(line)
}

/** 解析「当前条目 (Active)」段内的条目（排除「已蒸馏条目」段、缩进子 bullet 与注释）。 */
export function parseWisdom(markdown) {
    const [activePart = ''] = markdown.replace(/\r\n/g, '\n').split(/^##\s+已蒸馏条目/m)
    const body = activePart.split(/^##\s+当前条目[^\n]*\n/m)[1] ?? ''

    return body
        .split('\n')
        .filter((line) => isActiveEntryLine(line))
        .map((line) => line.replace(/^-\s+/, '').trim())
}

export function countActiveEntries(markdown) {
    return parseWisdom(markdown).length
}

/** 读取 wisdom 文件；不存在时返回 null（不视为错误）。 */
export function readWisdom(file = join(projectRoot, '.session/wisdom.md')) {
    if (!existsSync(file)) {
        return null
    }
    return readFileSync(file, 'utf8')
}

export function checkWisdom(file, threshold = DEFAULT_THRESHOLD) {
    const markdown = readWisdom(file)
    if (markdown === null) {
        return { available: false, count: 0, threshold, needsDistill: false }
    }
    const count = countActiveEntries(markdown)
    return { available: true, count, threshold, needsDistill: count >= threshold }
}

/** 阈值解析：非正数或非数字回退默认值。 */
export function resolveThreshold(value) {
    const parsed = Number(value)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_THRESHOLD
}

/** 执行一次蒸馏检查并返回结果与输出文案；便于单测注入 file。 */
export function runDistillWisdom(argv = [], options = {}) {
    const threshold = resolveThreshold(getArgValue(argv, '--threshold'))
    const result = checkWisdom(options.file, threshold)

    if (!result.available) {
        return { result, message: 'WISDOM_SKIPPED: wisdom not found' }
    }
    if (hasFlag(argv, '--check')) {
        const label = result.needsDistill ? 'WISDOM_NEEDS_DISTILL' : 'WISDOM_OK'
        return { result, message: `${label}: ${result.count} active entries (threshold ${result.threshold})` }
    }
    return { result, message: `WISDOM_REPORT: ${result.count} active entries (threshold ${result.threshold})` }
}

if (isDirectExecution(import.meta.url)) {
    const { message } = runDistillWisdom(process.argv.slice(2))
    console.info(message)
}
