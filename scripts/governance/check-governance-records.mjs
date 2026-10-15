#!/usr/bin/env node

/**
 * check-governance-records：治理记录的「索引一致性」与「历史规划指针」守卫。
 *
 * 两类检查：
 * 1. **治理记录索引完整性**：`docs/design/governance/index.md` 与同目录记录文件集合**双向对账**——
 *    每个记录文件必须被索引引用（missing-from-index），索引里的每条记录链接必须命中真实文件
 *    （dangling-index-entry）。索引此前靠人工维护，漏登记不会报错；本守卫把它变为可判定门禁。
 * 2. **历史规划指针失效**：指向 `docs/plan/` 载体的 Markdown 链接，若**链接文字**或**闭合符后紧邻处**
 *    含规划标识（阶段编号 / 条目编号），该标识必须在目标文件内出现；阶段归档后被清空的段落
 *    （标识已迁往 `todo-archive.md`）会被判为失效指针（stale-planning-pointer）。
 *
 * 有意边界：
 * - 「闭合符后紧邻处」只取**同一行**且 `)` 与标识之间仅允许分隔符（空白 / 括号 / 常见标点）；
 *   链接之后的散文叙述仍是快照，不纳入；
 * - 标识在目标文件里以任何语境出现即视为有效（同一编号在不同阶段的复用不另判）；
 * - 治理记录目录为**平铺**结构，索引里的嵌套路径不计为记录条目；
 * - 链接目标允许带 title（`(path "标题")`），标题不参与解析。
 *
 * 用法：
 *   node scripts/governance/check-governance-records.mjs [仓库根目录]
 */
import { existsSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs'
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
 * 索引条目里的「结论」指针形态：`结论见该记录 §N` / `结论见本记录 §N`（**全量覆盖面**）。
 *
 * 语义锚（动词「结论见」+「该 / 本记录」）用于覆盖**长式条目**——`Review Gate` 字样与指针相距数百字符的写法，
 * 而长式恰含上一批复发载体本身的写法（邻近窗口版实测漏检 12 条）。
 */
export const REVIEW_GATE_POINTER_RE = /结论见(?:该|本)记录\s*§\s*(\d+)/g

/**
 * 「结论」指针的 **RG 归属面**：`Review Gate` / `RG` 字样之后 12 字符内紧跟「（结论）见该 / 本记录 §N」。
 *
 * 只用语义锚会把「用户裁定**结论**见该记录 §N」一并纳入（实测 2 例误判：指向「决策结果与登记结果」节），
 * 故归属面取「RG 字样紧邻」这一可判定特征：该面内的指针必须指向 Review Gate 节（复发对的写法正在此面内）。
 * 三种候选形态实测（索引全量）：仅「结论见」= 5 条命中；含「见」的 12 字符版 = **12 条命中、0 误判**（本实现）；
 * 放宽到 20 字符不再增加命中。
 */
export const REVIEW_GATE_ADJACENT_RE = /(?:Review Gate|RG)[^\n]{0,12}?(?:结论)?见(?:该|本)记录\s*§\s*(\d+)/g

/** 受检面下界：索引内受检的「结论」指针少于该值即判失败（防约定写法消失后静默空转）。 */
export const REVIEW_GATE_POINTER_LOWER_BOUND = 12

/** 归属面下界：RG 邻近指针少于该值即判失败（复发对所在面被削弱时不得静默通过）。 */
export const REVIEW_GATE_ADJACENT_LOWER_BOUND = 10

/** 章节切分（可选编号 + 标题），用于取 Review Gate 节正文以判定是否仍为占位。 */
export const MD_HEADING_RE = /^#{1,6}[ \t]*(?:(\d+)\s*[.．、:：][ \t]*)?(.*)$/gm

/** 尚未执行审计的占位正文（`待 Review Gate 执行后同批回填` 一类）。 */
export const REVIEW_GATE_PLACEHOLDER_RE = /待\s*Review Gate\s*执行后同批回填/

/** 索引条目里「结论稍后回填」的显式标记（有此标记时允许指针暂指占位节）。 */
export const REVIEW_GATE_PENDING_MARK_RE = /同批回填/

/** 链接闭合符与「紧邻标识」之间允许的分隔符（空白 / 括号 / 常见标点 / 表格与强调标记）。 */
const TRAILING_SEPARATOR_RE = /^[\s)）】:：,，。、·|*_—-]*/

/** 紧邻标识的匹配（行首即标识，后随非字母数字）。 */
const TRAILING_ID_RE = /^(?:Phase\s+\d+|[A-Z]{1,3}\d{1,3}(?:-\d{1,3})?)(?![A-Za-z0-9])/

/**
 * 提取链接闭合符后**紧邻**的规划标识（同一行，仅允许分隔符相隔）。
 *
 * @param {string} content 文件全文
 * @param {number} linkEndOffset 链接匹配结束（`)` 之后）的偏移
 * @returns {string[]} 紧邻标识（至多一个）
 */
export function collectTrailingIdentifiers(content, linkEndOffset) {
    const sameLine = content.slice(linkEndOffset).split(/\r?\n/, 1)[0]
    const stripped = sameLine.replace(TRAILING_SEPARATOR_RE, '')
    const match = stripped.match(TRAILING_ID_RE)
    return match ? [match[0]] : []
}

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
            const identifiers = [
                ...new Set([
                    ...(text.match(PLANNING_ID_RE) ?? []),
                    ...collectTrailingIdentifiers(content, (match.index ?? 0) + match[0].length),
                ]),
            ]
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
 * 索引条目的「Review Gate 结论指针」章节号校验。
 *
 * 背景：索引摘要常写「**Review Gate**：结论见该记录 §7」。章节号是治理台账的可追溯锚点
 * （[规划规范 §9](../../docs/standards/planning.md)「台账里引用『某文档 §某节』时必须逐条回查实际改动位置」）；
 * 写错等于把「待回填」读成「已放行」，且**同类错误曾在相邻两批重复发生**（部分归档批次与范围评估批次），
 * 故由人工回查升级为机检约束。
 *
 * 判据：指针指向的章节号必须对应目标记录里**以 `Review Gate` 命名**的小节
 * （排除「条目小节标题里恰好含 Review Gate 字样」这类小节的做法是**逐指针比对标题**，而非全文件取「唯一 RG 节」）；
 * 且该节**不得仍是占位正文**（写「待 Review Gate 执行后同批回填」而索引未标「同批回填」＝把待回填读成已放行）。
 *
 * @param {string} root 仓库根目录
 * @param {{ lowerBound?: number }} [options] 受检面下界（默认取 `REVIEW_GATE_POINTER_LOWER_BOUND`）
 * @returns {{ issues: Array<{ type: string, file: string, line: number, message: string, hint: string }>, pointers: number, entries: number }}
 */
export function collectReviewGatePointerIssues(root = projectRoot, options = {}) {
    const lowerBound = options.lowerBound ?? REVIEW_GATE_POINTER_LOWER_BOUND
    const adjacentLowerBound = options.adjacentLowerBound ?? REVIEW_GATE_ADJACENT_LOWER_BOUND
    const issues = []
    const indexPath = join(root, INDEX_FILE)
    if (!existsSync(indexPath)) {
        return { issues, pointers: 0, adjacent: 0, entries: 0 }
    }
    const content = readFileSync(indexPath, 'utf8')
    const dir = dirname(indexPath)
    const sectionCache = new Map()
    const sectionsOf = (target) => {
        if (!sectionCache.has(target)) {
            const sections = new Map()
            const absolute = join(root, target)
            if (existsSync(absolute)) {
                const fileContent = readFileSync(absolute, 'utf8')
                const headings = [...fileContent.matchAll(MD_HEADING_RE)]
                for (let index = 0; index < headings.length; index += 1) {
                    const [, number, title] = headings[index]
                    if (!number) {
                        continue
                    }
                    const bodyStart = (headings[index].index ?? 0) + headings[index][0].length
                    const bodyEnd = index + 1 < headings.length ? (headings[index + 1].index ?? fileContent.length) : fileContent.length
                    const body = fileContent.slice(bodyStart, bodyEnd)
                    const isReviewGate = /Review Gate/i.test(title ?? '')
                    sections.set(number, {
                        isReviewGate,
                        pending: isReviewGate && (body.trim().length === 0 || REVIEW_GATE_PLACEHOLDER_RE.test(body)),
                    })
                }
            }
            sectionCache.set(target, sections)
        }
        return sectionCache.get(target)
    }

    let pointers = 0
    let adjacent = 0
    let entries = 0
    for (const match of content.matchAll(MD_LINK_RE)) {
        const raw = match[2]
        if (/^(?:https?:|mailto:|tel:|#)/.test(raw)) {
            continue
        }
        const pathPart = raw.split('#')[0].trim().split(/\s+/)[0]
        if (!pathPart) {
            continue
        }
        const rel = relative(root, resolve(dir, pathPart)).replaceAll('\\', '/')
        if (rel === INDEX_FILE || !rel.startsWith(`${GOVERNANCE_DIR}/`) || rel.slice(GOVERNANCE_DIR.length + 1).includes('/')) {
            continue
        }
        const linkOffset = match.index ?? 0
        const lineStart = content.lastIndexOf('\n', linkOffset) + 1
        const lineEnd = content.indexOf('\n', linkOffset)
        const line = content.slice(lineStart, lineEnd === -1 ? content.length : lineEnd)
        const lineNumber = lineOf(content, linkOffset)
        entries += 1
        const markedPending = REVIEW_GATE_PENDING_MARK_RE.test(line)
        const adjacentNumbers = new Set([...line.matchAll(REVIEW_GATE_ADJACENT_RE)].map((item) => item[1]))
        adjacent += adjacentNumbers.size
        for (const pointer of line.matchAll(REVIEW_GATE_POINTER_RE)) {
            pointers += 1
            const section = pointer[1]
            const sections = sectionsOf(rel)
            const target = sections.get(section)
            if (!target) {
                issues.push({
                    type: 'rg-pointer-section-missing',
                    file: INDEX_FILE,
                    line: lineNumber,
                    message: `索引条目称「结论见该记录 §${section}」，但 ${rel} 无 §${section}（现有章节：§${[...sections.keys()].join(' / §')}）`,
                    hint: '把指针改指目标记录真实存在的章节号',
                })
                continue
            }
            if (!target.isReviewGate) {
                if (!adjacentNumbers.has(section)) {
                    continue
                }
                const rgSections = [...sections.entries()].filter(([, value]) => value.isReviewGate).map(([key]) => key)
                issues.push({
                    type: 'rg-pointer-section-mismatch',
                    file: INDEX_FILE,
                    line: lineNumber,
                    message: rgSections.length === 0
                        ? `索引条目的 Review Gate 结论指针指向 §${section}，但 ${rel} 无以 Review Gate 命名的章节`
                        : `索引条目的 Review Gate 结论指针指向 §${section}，但 ${rel} 的 Review Gate 节为 §${rgSections.join(' / §')}`,
                    hint: '把指针改指目标记录中 Review Gate 所在章节号，或在该记录补 `## N. Review Gate` 节',
                })
                continue
            }
            if (target.pending && !markedPending) {
                issues.push({
                    type: 'rg-pointer-target-pending',
                    file: INDEX_FILE,
                    line: lineNumber,
                    message: `索引条目的 Review Gate 指针指向 ${rel} 尚未回填的 §${section}，且条目未标「同批回填」`,
                    hint: '在索引条目补「同批回填」标记，或等记录 §Review Gate 回填结论后再登记',
                })
            }
        }
    }

    if (pointers < lowerBound) {
        issues.push({
            type: 'rg-pointer-surface-below-bound',
            file: INDEX_FILE,
            line: null,
            message: `受检「结论」指针 ${pointers} 条，低于下界 ${lowerBound}：拒绝以空扫描通过`,
            hint: '索引条目的结论指针写成「结论见该记录 §N」（含 RG 结论写在 Review Gate 字样之后）',
        })
    }
    if (adjacent < adjacentLowerBound) {
        issues.push({
            type: 'rg-pointer-adjacent-below-bound',
            file: INDEX_FILE,
            line: null,
            message: `RG 邻近指针 ${adjacent} 条，低于下界 ${adjacentLowerBound}：RG 归属面被削弱，拒绝静默通过`,
            hint: 'RG 结论写成「**Review Gate**：结论见该记录 §N」，使 RG 归属可机检',
        })
    }
    return { issues, pointers, adjacent, entries }
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
 * 执行三类检查。
 *
 * `options.rgPointerLowerBound` / `options.rgPointerAdjacentLowerBound` 省略时取对应常量；CLI 对
 * **非默认根**（最小夹具 / 第三方仓库）传 0 —— 夹具只覆盖判据本身，不含「结论见该记录 §N」的仓库级约定写法。
 *
 * @param {string} root 仓库根目录
 * @param {{ rgPointerLowerBound?: number, rgPointerAdjacentLowerBound?: number }} [options] 受检面下界覆盖
 * @returns {{ indexIssues: Array<object>, pointerIssues: Array<object>, rgPointerIssues: Array<object>, rgPointers: number, rgPointerAdjacent: number, rgPointerEntries: number, recordFiles: number, markdownFiles: number }} 检查结果
 */
export function runGovernanceRecordsCheck(root = projectRoot, options = {}) {
    const files = collectMarkdownFiles(root)
    const reviewGate = collectReviewGatePointerIssues(root, {
        lowerBound: options.rgPointerLowerBound ?? REVIEW_GATE_POINTER_LOWER_BOUND,
        adjacentLowerBound: options.rgPointerAdjacentLowerBound ?? REVIEW_GATE_ADJACENT_LOWER_BOUND,
    })
    return {
        indexIssues: checkGovernanceIndex(root),
        pointerIssues: collectPlanningPointerIssues(root, files),
        rgPointerIssues: reviewGate.issues,
        rgPointers: reviewGate.pointers,
        rgPointerAdjacent: reviewGate.adjacent,
        rgPointerEntries: reviewGate.entries,
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
        // 受检面下界只在仓库自身生效：夹具 / 第三方根不含「结论见该记录 §N」的仓库级约定写法。
        // 用 realpath 归一后比较，避免以符号链接 / 别名路径传仓库根时静默豁免下界。
        const realpath = (target) => {
            try {
                return realpathSync(target)
            } catch {
                return resolve(target)
            }
        }
        const isDefaultRoot = realpath(targetRoot) === realpath(projectRoot)
        if (!isDefaultRoot) {
            process.stderr.write(`[check-governance-records] 注意：${targetRoot} 非仓库自身，RG 指针受检面下界未生效\n`)
        }
        const { indexIssues, pointerIssues, rgPointerIssues, rgPointers, rgPointerAdjacent, recordFiles, markdownFiles } = runGovernanceRecordsCheck(targetRoot, isDefaultRoot ? {} : { rgPointerLowerBound: 0, rgPointerAdjacentLowerBound: 0 })
        const issues = [...indexIssues, ...pointerIssues, ...rgPointerIssues]
        if (issues.length > 0) {
            for (const issue of issues) {
                const location = issue.line === null ? issue.file : `${issue.file}:${issue.line}`
                process.stderr.write(`${location}:${issue.type}: ${issue.message}\n`)
                process.stderr.write(`  修复方向：${issue.hint}\n`)
            }
            process.stderr.write(`[check-governance-records] ${issues.length} 处问题（索引 ${indexIssues.length} / 规划指针 ${pointerIssues.length} / RG 指针 ${rgPointerIssues.length}）\n`)
            process.exitCode = 1
        } else {
            process.stdout.write(`[check-governance-records] OK：${recordFiles} 个治理记录与索引一致，${markdownFiles} 个 md 的历史规划指针无失效，${rgPointers} 条索引结论指针（其中 RG 邻近 ${rgPointerAdjacent} 条）章节号一致\n`)
        }
    }
}
