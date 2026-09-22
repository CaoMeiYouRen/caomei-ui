#!/usr/bin/env node

/**
 * check-governance-records：治理记录的「索引一致性」与「历史规划指针」守卫。
 *
 * 两类检查：
 * 1. **治理记录索引完整性**：`docs/design/governance/index.md` 与同目录记录文件集合**双向对账**——
 *    每个记录文件必须被索引引用（missing-from-index），索引里的每条记录链接必须命中真实文件
 *    （dangling-index-entry）。索引此前靠人工维护，漏登记不会报错；本守卫把它变为可判定门禁。
 * 2. **历史规划指针失效**：指向 `docs/plan/` 载体的 Markdown 链接，若**链接文字**含规划标识
 *    （阶段编号 / 条目编号），该标识必须在目标文件内出现；阶段归档后被清空的段落
 *    （标识已迁往 `todo-archive.md`）会被判为失效指针（stale-planning-pointer）。
 *
 * 有意边界：
 * - 只审**链接文字**中的标识，不审链接周围的散文（散文里的历史叙述是快照，允许保留）；
 * - 标识在目标文件里以任何语境出现即视为有效（同一编号在不同阶段的复用不另判）；
 * - 治理记录目录为**平铺**结构，索引里的嵌套路径不计为记录条目；
 * - 链接目标允许带 title（`(path "标题")`），标题不参与解析。
 *
 * 用法：
 *   node scripts/governance/check-governance-records.mjs [仓库根目录]
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 治理记录目录与索引文件（仓库相对路径）。 */
export const GOVERNANCE_DIR = 'docs/design/governance'
export const INDEX_FILE = 'docs/design/governance/index.md'

/** 规划载体目录前缀（历史规划指针的受检目标面）。 */
export const PLAN_DIR_PREFIX = 'docs/plan/'

/** 不参与扫描的目录名（依赖 / 产物 / 任务态 / 平台镜像）。 */
export const EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.nuxt',
    '.output',
    '.cache',
    'dist',
    'coverage',
    'logs',
    'tmp',
    'artifacts',
    'test-results',
    'playwright-report',
    '.session',
    '.temp',
    '.claude',
    '.agents',
    '.opencode',
    '.vitepress',
])

/** 不参与扫描的 Markdown 文件（生成物）。 */
export const IGNORED_FILES = new Set(['CHANGELOG.md'])

export const MD_LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g

/**
 * 规划标识形态：阶段编号（`Phase` + 数字）与条目 / 审计编号（字母 + 数字，可带 `-数字`）。
 * 与 check-planning-numbers 的形态矩阵同族，但只用于**链接文字**匹配，故不做代码词法切分。
 */
export const PLANNING_ID_RE = /Phase\s+\d+|(?<![A-Za-z0-9])[A-Z]{1,3}\d{1,3}(?:-\d{1,3})?(?![A-Za-z0-9])/g

/**
 * 收集仓库内 Markdown 文件。
 *
 * @param {string} root 仓库根目录
 * @returns {string[]} 仓库相对路径列表（已排序）
 */
export function collectMarkdownFiles(root = projectRoot) {
    const files = []
    walk(root, root, files)
    return files.map((file) => relative(root, file).replaceAll('\\', '/')).sort()
}

function walk(dir, root, out) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isSymbolicLink()) {
            continue
        }
        if (entry.isDirectory()) {
            if (EXCLUDED_DIRS.has(entry.name)) {
                continue
            }
            walk(full, root, out)
            continue
        }
        if (entry.name.endsWith('.md') && !IGNORED_FILES.has(entry.name)) {
            out.push(full)
        }
    }
}

/**
 * 收集治理记录文件（`docs/design/governance` 下的 md，排除索引自身）。
 *
 * @param {string} root 仓库根目录
 * @returns {string[]} 仓库相对路径列表（已排序）
 */
export function collectRecordFiles(root = projectRoot) {
    const dir = join(root, GOVERNANCE_DIR)
    if (!existsSync(dir)) {
        return []
    }
    return readdirSync(dir)
        .filter((name) => name.endsWith('.md') && name !== 'index.md')
        .map((name) => `${GOVERNANCE_DIR}/${name}`)
        .sort()
}

/**
 * 解析索引文件中的记录链接（解析后位于治理记录目录内者）。
 *
 * @param {string} root 仓库根目录
 * @returns {{ indexExists: boolean, entries: Array<{ raw: string, target: string, line: number }> }} 索引解析结果
 */
export function collectIndexEntries(root = projectRoot) {
    const indexPath = join(root, INDEX_FILE)
    if (!existsSync(indexPath)) {
        return { indexExists: false, entries: [] }
    }
    const content = readFileSync(indexPath, 'utf8')
    const dir = dirname(indexPath)
    const entries = []
    for (const match of content.matchAll(MD_LINK_RE)) {
        const raw = match[2]
        if (/^(?:https?:|mailto:|tel:|#)/.test(raw)) {
            continue
        }
        const pathPart = raw.split('#')[0].trim().split(/\s+/)[0]
        if (!pathPart) {
            continue
        }
        const resolved = resolve(dir, pathPart)
        const rel = relative(root, resolved).replaceAll('\\', '/')
        if (rel === INDEX_FILE || !rel.startsWith(`${GOVERNANCE_DIR}/`)) {
            continue
        }
        // 记录目录为平铺结构：嵌套路径不是治理记录，排除以免与 collectRecordFiles 的口径分叉
        if (rel.slice(GOVERNANCE_DIR.length + 1).includes('/')) {
            continue
        }
        entries.push({ raw, target: rel, line: lineOf(content, match.index ?? 0) })
    }
    return { indexExists: true, entries }
}

/**
 * 治理记录索引完整性：记录文件集合 ↔ 索引链接双向对账。
 *
 * @param {string} root 仓库根目录
 * @returns {Array<{ type: string, file: string, line: number | null, message: string, hint: string }>} 问题列表
 */
export function checkGovernanceIndex(root = projectRoot) {
    const issues = []
    const records = collectRecordFiles(root)
    const { indexExists, entries } = collectIndexEntries(root)

    if (!indexExists) {
        return [{ type: 'missing-index', file: INDEX_FILE, line: null, message: '治理索引文件不存在', hint: `补建 ${INDEX_FILE}` }]
    }
    if (records.length === 0) {
        return [{ type: 'empty-record-set', file: GOVERNANCE_DIR, line: null, message: '未找到任何治理记录文件：拒绝以空扫描通过', hint: '确认治理记录目录是否正确' }]
    }
    if (entries.length === 0) {
        return [{ type: 'empty-index', file: INDEX_FILE, line: null, message: '索引未解析到任何记录链接：拒绝以空扫描通过', hint: '索引条目应写成 `[说明](./<记录文件>.md)`' }]
    }

    const indexed = new Set(entries.map((entry) => entry.target))
    for (const record of records) {
        if (!indexed.has(record)) {
            issues.push({
                type: 'missing-from-index',
                file: INDEX_FILE,
                line: null,
                message: `记录文件未被索引收录：${record}`,
                hint: '在「当前条目」段补一条 `[<日期>-<主题>.md](./<文件>.md)` 索引行',
            })
        }
    }
    const recordSet = new Set(records)
    for (const entry of entries) {
        if (!recordSet.has(entry.target)) {
            issues.push({
                type: 'dangling-index-entry',
                file: INDEX_FILE,
                line: entry.line,
                message: `索引指向不存在的记录文件：${entry.raw}`,
                hint: '修正链接目标或删除失效索引行',
            })
        }
    }
    return issues
}

/**
 * 历史规划指针失效：链接文字含规划标识、但目标规划载体中已无该标识。
 *
 * @param {string} root 仓库根目录
 * @param {string[]} [files] 受检 Markdown 列表（省略时自行收集）
 * @returns {Array<{ type: string, file: string, line: number, message: string, hint: string }>} 问题列表
 */
export function collectPlanningPointerIssues(root = projectRoot, files = collectMarkdownFiles(root)) {
    const issues = []
    const cache = new Map()
    const readTarget = (target) => {
        if (!cache.has(target)) {
            const absolute = join(root, target)
            cache.set(target, existsSync(absolute) ? readFileSync(absolute, 'utf8') : null)
        }
        return cache.get(target)
    }

    for (const file of files) {
        const content = readFileSync(join(root, file), 'utf8')
        for (const match of content.matchAll(MD_LINK_RE)) {
            const text = match[1]
            const target = resolveLinkTarget(root, file, match[2])
            if (!target || !target.startsWith(PLAN_DIR_PREFIX)) {
                continue
            }
            const identifiers = [...new Set(text.match(PLANNING_ID_RE) ?? [])]
            if (identifiers.length === 0) {
                continue
            }
            const targetContent = readTarget(target)
            if (targetContent === null) {
                continue
            }
            const missing = identifiers.filter((identifier) => !targetContent.includes(identifier))
            if (missing.length === 0) {
                continue
            }
            issues.push({
                type: 'stale-planning-pointer',
                file,
                line: lineOf(content, match.index ?? 0),
                message: `链接文字含 ${missing.join(' / ')}，但目标 ${target} 已无该标识（阶段归档后段落被清空）`,
                hint: `历史阶段的登记改指 ${PLAN_DIR_PREFIX}todo-archive.md，或去掉链接文字中的编号`,
            })
        }
    }
    return issues
}

/**
 * 解析 Markdown 链接目标为仓库相对路径（兼容省略 `.md` 的写法）。
 *
 * @param {string} root 仓库根目录
 * @param {string} file 链接所在文件的仓库相对路径
 * @param {string} raw 原始链接目标
 * @returns {string | null} 仓库相对路径；非本地链接或越界时返回 null
 */
export function resolveLinkTarget(root, file, raw) {
    if (/^(?:https?:|mailto:|tel:|#|\/\/)/.test(raw)) {
        return null
    }
    const pathPart = raw.split('#')[0].trim().split(/\s+/)[0]
    if (!pathPart || pathPart.startsWith('/')) {
        return null
    }
    const base = dirname(join(root, file))
    const candidates = [resolve(base, pathPart)]
    if (!pathPart.endsWith('.md')) {
        candidates.push(resolve(base, `${pathPart}.md`))
    }
    for (const candidate of candidates) {
        const rel = relative(root, candidate).replaceAll('\\', '/')
        if (rel.startsWith('..')) {
            return null
        }
        if (existsSync(candidate) && statSync(candidate).isFile()) {
            return rel
        }
    }
    return null
}

function lineOf(content, offset) {
    let line = 1
    for (let index = 0; index < offset && index < content.length; index += 1) {
        if (content[index] === '\n') {
            line += 1
        }
    }
    return line
}

/**
 * 执行两类检查。
 *
 * @param {string} root 仓库根目录
 * @returns {{ indexIssues: Array<object>, pointerIssues: Array<object>, recordFiles: number, markdownFiles: number }} 检查结果
 */
export function runGovernanceRecordsCheck(root = projectRoot) {
    const files = collectMarkdownFiles(root)
    return {
        indexIssues: checkGovernanceIndex(root),
        pointerIssues: collectPlanningPointerIssues(root, files),
        recordFiles: collectRecordFiles(root).length,
        markdownFiles: files.length,
    }
}

/**
 * 校验命令行传入的目标目录：必须是含 `.github/` 的仓库根，非法参数不得静默放行。
 *
 * @param {string | undefined} arg 位置参数
 * @param {string} fallbackRoot 未传参时的默认根目录
 * @returns {{ root: string | null, error: string | null }} 目标根或错误原因
 */
export function resolveTargetRoot(arg, fallbackRoot = projectRoot) {
    if (!arg) {
        return { root: fallbackRoot, error: null }
    }
    if (arg.startsWith('-')) {
        return { root: null, error: `不支持的参数：${arg}` }
    }
    if (!existsSync(join(arg, '.github'))) {
        return { root: null, error: `目标目录不是仓库根（缺 .github/）：${arg}` }
    }
    return { root: arg, error: null }
}

if (isDirectExecution(import.meta.url)) {
    const { root: targetRoot, error: rootError } = resolveTargetRoot(process.argv[2])
    if (rootError) {
        process.stderr.write(`[check-governance-records] ${rootError}\n`)
        process.exitCode = 1
    } else {
        const { indexIssues, pointerIssues, recordFiles, markdownFiles } = runGovernanceRecordsCheck(targetRoot)
        const issues = [...indexIssues, ...pointerIssues]
        if (issues.length > 0) {
            for (const issue of issues) {
                const location = issue.line === null ? issue.file : `${issue.file}:${issue.line}`
                process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
                process.stderr.write(`  修复方向：${issue.hint}\n`)
            }
            process.stderr.write(`[check-governance-records] ${issues.length} 处问题（索引 ${indexIssues.length} / 规划指针 ${pointerIssues.length}）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-governance-records] OK：${recordFiles} 个治理记录与索引一致，${markdownFiles} 个 md 的历史规划指针无失效\n`)
        }
    }
}
