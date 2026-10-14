#!/usr/bin/env node

/**
 * check-governance-counts：**文档引述的数值常量 ↔ 代码常量**对账守卫。
 *
 * 为什么需要它：治理记录 / 规范会在正文里引述守卫与测试的**数值常量**（如 `` `MIN_RECONCILED = 25` ``、
 * `` `SCOPE_FLOOR.entries = 1` ``）。这些数字**有决策函数**——读者据此判断门禁参数与裕度；一旦与代码
 * 实际取值不符，会误导调参。该类曾在治理记录批次被判 blocker（守卫文件头声明的基线值与实跑不符）。
 *
 * **受检族的由来（2026-10-14，见 `docs/design/governance/2026-10-14-phase24-m3-7-index-readings-sweep-and-family-redefinition.md`）**：本守卫原对账 4 个「门禁读数复述」族（测试计数 /
 * e2e / 治理记录 / 文档取证命令）。依「**门禁读数不复述**」规则（[AI 协作规范 §9](../../docs/standards/ai-collaboration.md)），
 * 记录与索引**不再复述**命令输出计数 —— 索引存量亦已 sweep。复述面归零后，原 4 族**无可对账对象**，
 * 故按方案 A ④「收窄到仍有决策函数的族」将其**替换**为当前这一族（阈值 / 下界类常量的引述）。
 *
 * 判别规则：
 * - 引述形态：反引号包裹的「大写常量名 = 数字」（常量名以字母开头、可含下划线与数字）；
 * - 事实源：`scripts/**` 与 `test/**` 下的 `*.mjs` / `*.ts` 中**行首**的 `export const NAME = N` 与
 *   非导出 `const NAME = N`（测试内的受检面阈值多为非导出），以及 `SCOPE_FLOOR = { key: N }`
 *   （以 `SCOPE_FLOOR.key` 为名收录）。行首锚定可避免把夹具字符串字面量当作事实源。
 * - **同名常量跨文件按「取值集合」判定**（实测：`MIN_RECONCILED` 在不同守卫分别为 40 / 25，
 *   `MIN_SCANNED_FILES` 在 `check-class-prefix` 为 70、在 `check-interpolation` 为 150）——
 *   引述值命中集合中任一即通过；否则判 `const-value-mismatch` 并列出全部候选取值。
 * - 代码中**无同名常量**的引述**跳过**（可能是尚未落地 / 局部常量，不判失败也不计入比对）；
 * - **同一行内**（引述前 40 字符或**同行后缀** 40 字符）出现快照标记（`当时` / `快照` / `原为` / `曾为` / `此前` / `写录时点` / `点时值`）者，
 *   按「**写录时点快照**」跳过 —— 历史记录可保留当时取值，但**必须显式标注**；未标注即按现行引用对待。
 * - 受检面下界 `MIN_CITED_CONSTANTS`：**可比对的「不同常量名」数**低于下界判 `scope-narrowed`（防「解析被削弱 ⇒ 通过」）。
 *
 * 已知边界（有意）：
 * - 只认**字符串化的常量引述**（`NAME = N`）；散文里的裸数字（如「约三成」）不在面内；
 * - 不区分 `MIN_*` 与其它命名：凡文档以 `常量名 = 数字` 形式引述且代码侧存在同名常量者均在面内；
 * - **行首锚定**：**单行**夹具字符串里的 `const X = 1` 不会被采集；**多行模板字面量**内的行首 `const` 仍会被采集（已知边界，实测未产生伪常量）。
 *
 * 用法：
 *   node scripts/governance/check-governance-counts.mjs            # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-governance-counts.mjs --root <dir>
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 代码侧事实源目录（仓库相对路径）。 */
export const CODE_DIRS = ['scripts', 'test']

/** 文档侧受检目录。 */
export const DOC_DIR = 'docs'

/** 代码文件扩展名。 */
export const CODE_EXTENSIONS = ['.mjs', '.ts']

/** 不参与扫描的目录名。 */
export const EXCLUDED_DIRS = new Set(['node_modules', '.git', '.vitepress', 'coverage', 'dist', '.temp', 'artifacts'])

/** 引述形态（允许反引号；常量名可带 `.key` 后缀）。 */
export const DOC_CITATION_RE = /`([A-Z][A-Z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?)\s*=\s*(\d+)`/g

/**
 * 快照标记（出现在引述**之前**的近距离内即视为「点时快照」而跳过）。
 *
 * 依据「**写录时点快照**」口径：历史记录可以保留当时取值，但**必须显式标注**；
 * 未标注者一律按「现行引用」对待并要求与代码一致（这正是本守卫要抓的失配）。
 */
/**
 * 快照标记是否作用于该引述：**只看同一行**（跨行回看会把上一行的标记词枚举段误当标注，实测误免）。
 *
 * 依据 `SNAPSHOT_LOOKBEHIND` 窗口取该行内引述**之前**的文本；同时接受**同行后缀**标注
 * （如 `` `A = 1`（当时） ``）。
 *
 * @param {string} text 全文
 * @param {{ index: number, '0': string }} match 引述匹配
 * @returns {boolean}
 */
export function hasSnapshotMarker(text, match) {
    const lineStart = text.lastIndexOf('\n', match.index - 1) + 1
    const before = text.slice(Math.max(lineStart, match.index - SNAPSHOT_LOOKBEHIND), match.index)
    const lineEnd = text.indexOf('\n', match.index)
    const after = text.slice(match.index + match[0].length, lineEnd === -1 ? text.length : lineEnd).slice(0, SNAPSHOT_LOOKBEHIND)
    return SNAPSHOT_MARKERS.some((marker) => before.includes(marker) || after.includes(marker))
}

export const SNAPSHOT_MARKERS = ['当时', '快照', '原为', '曾为', '此前', '写录时点', '点时值']

/** 快照标记的回看窗口（字符数）。 */
export const SNAPSHOT_LOOKBEHIND = 40

/**
 * 代码侧常量（**行首锚定**，避免把测试夹具里的字符串字面量当作事实源）。
 *
 * 覆盖 `export const` 与**非导出** `const`（后者承载测试内的受检面下界，如视觉 / e2e 阈值）。
 */
export const CODE_CONST_RE = /^[ \t]*(?:export )?const ([A-Z][A-Z0-9_]{2,})\s*=\s*(\d+)/gm

/** 代码侧 `SCOPE_FLOOR = { key: N }`（以 `SCOPE_FLOOR.key` 收录）。 */
export const SCOPE_FLOOR_RE = /^[ \t]*export const SCOPE_FLOOR\s*=\s*\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*:\s*(\d+)/gm

/**
 * 受检面下界（防静默收窄）。
 *
 * 语义：**可比对的「不同常量名」数**（文档引述的常量名在代码侧存在）不得低于该值 ——
 * 按**名**而非**处**计，避免「删掉一条同源引述」被误判为解析面收窄。
 * 取值口径：按上线时**实跑的引述处数**取同数量级的保守值（只拦「数量级收窄」、不追求贴身）；
 * 实跑值随文档增长、**不在注释里复述**，复算命令见本文件头「用法」。
 */
export const MIN_CITED_CONSTANTS = 8

/** 治理索引（存量 sweep 的受检面）。 */
export const INDEX_FILE = 'docs/design/governance/index.md'

/**
 * 索引「命令输出总量」类读数残留（**sweep 的防复发机检**）。
 *
 * 为什么机检：索引存量的清除曾靠人工逐处复核，实测**未收口**（残留 bold 内嵌与
 * `N 文件 / tests` 等形态）——人工复核不足以收口，故落为断言。
 *
 * 只在**索引**上断言（记录本体按「写录时点快照」保留）；只拦**命令输出总量**形态，
 * 不拦判别力 / 负向对照的局部量（规范例外②）。
 */
export const READING_RESIDUE_PATTERNS = [
    { id: 'files-cases', re: /\d+\s*文件\s*\/\s*(?:\*\*)?\d+\s*例/g },
    { id: 'files-tests', re: /\d+\s*文件\s*\/\s*tests/g },
    { id: 'records-pointers', re: /\d+\s*记录\s*\/\s*\d+\s*指针/g },
    { id: 'md-commands', re: /\d+\s*md\s*\/\s*\d+\s*命令/g },
    { id: 'dangling-tests', re: /(?:=|，|；|、)\s*tests\b|（tests）|（\d*\s*passed）/g },
    { id: 'files-cases-bold', re: /\*\*\d+\s*文件\*\*\s*\/\s*\d+/g },
]

/** 失败码。 */
export const ISSUE_CODES = {
    mismatch: 'const-value-mismatch',
    scopeNarrowed: 'scope-narrowed',
    indexResidue: 'index-reading-residue',
    ioError: 'io-error',
}

/**
 * 校验索引不存在「命令输出总量」类读数残留。
 *
 * @param {string} root 仓库根
 * @returns {Array<{ code: string, detail: string }>}
 */
export function checkIndexReadingResidue(root) {
    const abs = join(root, INDEX_FILE)
    if (!existsSync(abs)) {
        return []
    }
    const text = readFileSync(abs, 'utf8')
    const issues = []
    for (const { id, re } of READING_RESIDUE_PATTERNS) {
        const found = [...text.matchAll(re)]
        if (found.length > 0) {
            issues.push({
                code: ISSUE_CODES.indexResidue,
                detail: `${INDEX_FILE}：仍有「命令输出总量」读数残留 ${found.length} 处（形态 \`${id}\`，首例：${found[0][0].trim()}）——索引只写「结论 + 记录链接」`,
            })
        }
    }
    return issues
}

/**
 * 递归列出某目录下指定扩展名的文件（仓库相对路径）。
 *
 * @param {string} root 仓库根
 * @param {string} dir 仓库相对目录
 * @param {string[]} extensions 扩展名白名单
 * @returns {string[]}
 */
function listFiles(root, dir, extensions) {
    const abs = join(root, dir)
    if (!existsSync(abs)) {
        return []
    }
    const out = []
    const walk = (current) => {
        for (const name of readdirSync(current).sort()) {
            if (EXCLUDED_DIRS.has(name)) {
                continue
            }
            const full = join(current, name)
            let stat
            try {
                stat = statSync(full)
            } catch {
                continue
            }
            if (stat.isDirectory()) {
                walk(full)
            } else if (extensions.some((ext) => name.endsWith(ext))) {
                out.push(relative(root, full))
            }
        }
    }
    walk(abs)
    return out
}

/**
 * 采集代码侧常量（名 → 取值集合）。
 *
 * @param {string} root 仓库根
 * @returns {Map<string, Set<string>>}
 */
export function collectCodeConstants(root) {
    const map = new Map()
    const add = (name, value) => {
        if (!map.has(name)) {
            map.set(name, new Set())
        }
        map.get(name).add(value)
    }
    for (const dir of CODE_DIRS) {
        for (const file of listFiles(root, dir, CODE_EXTENSIONS)) {
            const text = readFileSync(join(root, file), 'utf8')
            for (const match of text.matchAll(CODE_CONST_RE)) {
                add(match[1], match[2])
            }
            for (const match of text.matchAll(SCOPE_FLOOR_RE)) {
                add(`SCOPE_FLOOR.${match[1]}`, match[2])
            }
        }
    }
    return map
}

/**
 * 对账文档引述与代码常量。
 *
 * @param {string} root 仓库根
 * @param {{ enforceScope?: boolean, minCited?: number }} [options]
 * @returns {{ cited: number, distinctNames: number, scannedDocs: number, issues: Array<{ code: string, detail: string }> }}
 */
export function checkGovernanceCounts(root, { enforceScope = true, minCited = MIN_CITED_CONSTANTS } = {}) {
    const issues = []
    let cited = 0
    let scannedDocs = 0
    const distinctNames = new Set()
    let codeConstants
    try {
        codeConstants = collectCodeConstants(root)
    } catch (error) {
        return {
            cited: 0,
            scannedDocs: 0,
            issues: [{ code: ISSUE_CODES.ioError, detail: `读取代码常量失败：${error.message}` }],
        }
    }

    const docs = listFiles(root, DOC_DIR, ['.md'])
    for (const file of docs) {
        let text
        try {
            text = readFileSync(join(root, file), 'utf8')
        } catch {
            continue
        }
        scannedDocs += 1
        for (const match of text.matchAll(DOC_CITATION_RE)) {
            const name = match[1]
            const value = match[2]
            const candidates = codeConstants.get(name)
            if (!candidates) {
                continue
            }
            if (hasSnapshotMarker(text, match)) {
                continue
            }
            cited += 1
            distinctNames.add(name)
            if (!candidates.has(value)) {
                issues.push({
                    code: ISSUE_CODES.mismatch,
                    detail: `${file}：引述 \`${name} = ${value}\`，与代码常量不符（代码取值：${[...candidates].sort().join(' / ')}）`,
                })
            }
        }
    }

    issues.push(...checkIndexReadingResidue(root))

    if (enforceScope && distinctNames.size < minCited) {
        issues.push({
            code: ISSUE_CODES.scopeNarrowed,
            detail: `可比对的**不同常量名** ${distinctNames.size} 个低于下界 ${minCited}（引述 ${cited} 处 / 受检文档 ${scannedDocs} 个；解析面可能被静默削弱）`,
        })
    }

    return { cited, distinctNames: distinctNames.size, scannedDocs, issues }
}

export function main(argv = process.argv.slice(2)) {
    let root = projectRoot
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-governance-counts] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-governance-counts] 目标目录不存在：${root}`)
        return 2
    }

    const { cited, distinctNames, scannedDocs, issues } = checkGovernanceCounts(root)
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-governance-counts][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-governance-counts] ${issues.length} 处问题（受检文档 ${scannedDocs} / 可比对引述 ${cited} / 不同常量名 ${distinctNames}）`)
        return 1
    }
    console.info(`[check-governance-counts] OK：受检文档 ${scannedDocs} 个、可比对常量引述 ${cited} 处（不同常量名 ${distinctNames} 个），取值与代码一致`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
