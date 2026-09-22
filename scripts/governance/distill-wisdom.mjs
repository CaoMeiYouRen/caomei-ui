#!/usr/bin/env node

/**
 * distill-wisdom：统计 `.session/wisdom.md` 活跃条目数，并做**蒸馏计数对账**。
 *
 * 活跃条目格式（权威定义见 docs/standards/session-wisdom-distillation.md）：
 * - 顶层 bullet：`- [YYYY-MM-DD] [type] 摘要`（缩进的子 bullet 不计入）；
 * - 兼容无 bullet 的迁移摘要行：`[YYYY-MM-DD] [type] 摘要 → docs/path`。
 *
 * 蒸馏计数对账（`--reconcile`）：经验归档的每个批次段在**前言**（首个顶层 bullet / `###` 前）声明
 * 「活跃 N 条」（可另带「归档摘要 N 行」），脚本按段内顶层 bullet 数复算并逐段对账；声明缺失或
 * 数值不符即 exit 1。起始对账批次由 `RECONCILE_REQUIRED_FROM` 定义（更早的批次为旧格式，不强制声明）。
 * 归档文件缺失按失败退出（受版本控制的载体，缺失即门禁不可用）。`--reconcile` 优先于 `--check`。
 *
 * 用法：
 *   node scripts/governance/distill-wisdom.mjs                       # 输出统计报告
 *   node scripts/governance/distill-wisdom.mjs --check               # 仅输出阈值结论（退出码恒为 0）
 *   node scripts/governance/distill-wisdom.mjs --reconcile           # 蒸馏计数对账（不符即 exit 1）
 *   node scripts/governance/distill-wisdom.mjs --threshold=15
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getArgValue, hasFlag, isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const DEFAULT_THRESHOLD = 20

/** 可提交的经验归档（计数对账的受检载体，相对仓库根）。 */
export const ARCHIVE_FILE = 'docs/design/governance/experience-archive.md'
/** 自该批次日期起，经验归档段必须声明「活跃 N 条」并与段内条目数一致。 */
export const RECONCILE_REQUIRED_FROM = '2026-09-14'

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

/** 读取经验归档文件；不存在时返回 null（不视为错误）。 */
export function readArchive(file = join(projectRoot, ARCHIVE_FILE)) {
    if (!existsSync(file)) {
        return null
    }
    return readFileSync(file, 'utf8')
}

/**
 * 解析经验归档的批次段：标题、批次日期、计数声明与段内顶层 bullet 数。
 * 计数声明只在前言（首个顶层 bullet / `###` 前）识别，与规范口径一致。
 *
 * @param {string} markdown 归档文件内容
 * @returns {Array<{ title: string, date: string | null, declared: number | null, archivedLines: number | null, bullets: number }>} 批次段列表
 */
export function parseArchiveSections(markdown) {
    const sections = []
    let current = null
    for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
        const heading = line.match(/^##\s+(.+?)\s*$/u)
        if (heading) {
            current = {
                title: heading[1],
                date: heading[1].match(/^\d{4}-\d{2}-\d{2}/u)?.[0] ?? null,
                declared: null,
                archivedLines: null,
                bullets: 0,
                preamble: true,
            }
            sections.push(current)
            continue
        }
        if (!current) {
            continue
        }
        if (current.preamble) {
            if (current.declared === null) {
                const declared = line.match(/活跃\s*\*{0,2}(\d+)\s*条/u)
                if (declared) {
                    current.declared = Number(declared[1])
                }
            }
            if (current.archivedLines === null) {
                const archived = line.match(/归档摘要\s*\*{0,2}(\d+)\s*行/u)
                if (archived) {
                    current.archivedLines = Number(archived[1])
                }
            }
        }
        if (/^###\s/u.test(line) || /^- /u.test(line)) {
            current.preamble = false
        }
        if (/^- /u.test(line)) {
            current.bullets += 1
        }
    }
    return sections
}

/**
 * 蒸馏计数对账：逐段比对「声明值」与「段内顶层 bullet 数」。
 *
 * @param {string} markdown 归档文件内容
 * @returns {Array<{ title: string | null, type: string, message: string }>} 问题列表（空数组即对账通过）
 */
export function reconcileArchive(markdown) {
    const sections = parseArchiveSections(markdown)
    if (sections.length === 0) {
        return [{ title: null, type: 'empty-archive', message: '未解析到任何归档批次段：拒绝以空扫描通过' }]
    }
    const issues = []
    let declaredCount = 0
    for (const section of sections) {
        const required = section.date !== null && section.date >= RECONCILE_REQUIRED_FROM
        if (section.declared === null) {
            if (required) {
                issues.push({ title: section.title, type: 'missing-declaration', message: `批次段缺「活跃 N 条」计数声明（${RECONCILE_REQUIRED_FROM} 起必填）` })
            }
            continue
        }
        declaredCount += 1
        if (section.declared !== section.bullets) {
            issues.push({ title: section.title, type: 'count-mismatch', message: `声明活跃 ${section.declared} 条，段内顶层 bullet 实为 ${section.bullets} 行` })
        }
        if (section.archivedLines !== null && section.archivedLines !== section.bullets) {
            issues.push({ title: section.title, type: 'archived-lines-mismatch', message: `声明归档摘要 ${section.archivedLines} 行，段内顶层 bullet 实为 ${section.bullets} 行` })
        }
    }
    const recentSections = sections.filter((section) => section.date !== null && section.date >= RECONCILE_REQUIRED_FROM)
    if (recentSections.length === 0 && declaredCount === 0) {
        issues.push({ title: null, type: 'no-declaration', message: `没有任何批次段声明计数（亦无 ${RECONCILE_REQUIRED_FROM} 起的批次）：拒绝以空扫描通过` })
    }
    return issues
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

/** 执行一次蒸馏检查或计数对账并返回结果与输出文案；便于单测注入 file / archiveFile。 */
export function runDistillWisdom(argv = [], options = {}) {
    const threshold = resolveThreshold(getArgValue(argv, '--threshold'))

    if (hasFlag(argv, '--reconcile')) {
        const markdown = readArchive(options.archiveFile)
        if (markdown === null) {
            return { result: { available: false, issues: [] }, message: 'WISDOM_ARCHIVE_MISSING: archive not found', exitCode: 1 }
        }
        const issues = reconcileArchive(markdown)
        if (issues.length === 0) {
            const sections = parseArchiveSections(markdown).length
            return { result: { available: true, issues }, message: `WISDOM_ARCHIVE_OK: ${sections} archive sections reconciled` }
        }
        const detail = issues.map((issue) => `- ${issue.title ?? '<archive>'} [${issue.type}] ${issue.message}`).join('\n')
        return { result: { available: true, issues }, message: `WISDOM_ARCHIVE_MISMATCH: ${issues.length} issue(s)\n${detail}`, exitCode: 1 }
    }

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
    const { message, exitCode = 0 } = runDistillWisdom(process.argv.slice(2))
    if (exitCode === 0) {
        console.info(message)
    } else {
        console.error(message)
        process.exitCode = exitCode
    }
}
