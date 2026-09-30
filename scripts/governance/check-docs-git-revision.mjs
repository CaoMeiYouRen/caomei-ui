#!/usr/bin/env node

/**
 * check-docs-git-revision：文档内取证命令的 revision 钉定守卫。
 *
 * 为什么需要它：写在 `docs/` 里的取证命令一旦用 `HEAD` 或裸分支名作 revision，工具提交落地后
 * **结论不可复算**——同一批次连续两轮命中该类问题（见 `docs/design/governance/2026-09-29-caumei-selector-typo-fix-and-release-registration.md`
 * 与 `docs/standards/ai-collaboration.md` §9）。
 *
 * 口径（「要求显式 revision」的可判定化，显式声明）：
 * 只对**出现在 revision 位置**的令牌施加约束——存在于该位置的 revision 必须是**持久 ref**
 * （commit hash / tag / `<base>..<end>` / 文档占位符 `<...>`），且**禁 `HEAD`**（含 `HEAD~n` / `HEAD^n` / `@`）。
 * **不计入**的形态及理由（把「每条命令都必须写 rev」字面执行会产生 15+ 处误报并与命令语义冲突）：
 * - index / worktree 作用域：`git diff --cached`、`git show :<file>`、`git diff <path>`——以当前索引 / 工作区为输入，本就无 rev；
 * - `git grep <pattern> [-- paths]`——默认扫工作区，rev 仅在 pattern 之后才出现；
 * - **零 rev 的 `git log` / `git show` / `git diff`**——缺省作用于 `HEAD` / 工作区，属**有意不在面内**
 *   （它们是「看当前状态」的 prose 示例形态；若作计数取证须显式写 rev）。这是**已知边界**，不是「无 rev 概念」；
 * - 反引用的 prose 提及：代码区内仅写命令名（`git diff`）的说明性片段。
 * - **引号内的 revision**：引号内容会被剥离（避免把 `-S'.x'` / `--grep='^feat'` 当 rev），故引号内的
 *   **HEAD 会另行检出并判违规**（fail-closed）；引号内的**非 HEAD 非持久 ref**（如 `"main"`）仍不在面内（已知边界）。
 * - **含 `/` 的令牌**：仅当它是**仓库内已存在路径**或带文件扩展名时按 pathspec 处理；否则按 ref 判定
 *   （`origin/main` / `feature/foo` 等非持久 ref 会被拦下）——避免「路径启发式」成为 fail-open 通道。
 *
 * 规则（T1~T5）：
 * - T1 `head-revision`——revision 位出现 `HEAD`（`HEAD~n` / `HEAD^n` / `@` 同）即违规。
 * - T2 `non-persistent-revision`——revision 位出现非持久形态（裸分支名 / `@{u}` 等）即违规。
 * - T3 `unverifiable-shape`——命令含命令替换 / 变量展开（`$(` / 反引号 / `$VAR`）时 fail-closed：
 *   无法判定 rev 位置，须改写为可静态判定的形态。
 * - T4 `exempt-rot`——豁免清单**反向校验**：豁免项不再命中任何命令即报错（防永久豁免）。
 * - T5 `scope-narrowed`——受检面下界（md 文件数 / 代码区行数 / 命中命令数），防静默收窄。
 *
 * 边界：
 * - 只扫描 `docs/**` 的**代码区**（围栏代码块 + 行内代码段），逐行解析、**不跨行**——规避同类守卫
 *   跨行误解析的实测缺陷（评估记录 §6）。
 * - 引号内容先剥离，故 `-S'.caomei'` / `--grep='^feat'` / `':!node_modules'` 不会被当作 revision。
 * - `src/**` / `scripts/**` / 仓库根 md 不在面内（本条只治理 `docs/` 的取证命令）。
 *
 * 用法：
 *   node scripts/governance/check-docs-git-revision.mjs   # 有违规 exit 1
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const DOCS_DIR = join(REPO_ROOT, 'docs')

/** 受检子命令。 */
export const GIT_SUBCOMMANDS = ['log', 'show', 'diff', 'grep']

/**
 * 豁免命令清单（逐条写明理由，受 T4 反向校验）。
 *
 * 形态：`{ file（仓库相对路径）, pattern（匹配 `git …` 起、到行内分隔符为止的命令文本）, reason }`。
 */
export const EXEMPT_COMMANDS = [
    {
        file: 'docs/standards/git.md',
        pattern: /^git\s+log\s+HEAD\.\.@\{u\}$/,
        reason: '上游同步惯用法：`HEAD..@{u}` 语义即「本地领先上游的提交」，任一检出均可复算，非取证边界',
    },
    {
        file: 'docs/standards/ai-collaboration.md',
        pattern: /^git\s+log\s+f1b0b22\.\.HEAD$/,
        reason: '规范中的**反例**：用于说明「不得写 HEAD 相对范围」这一被禁形态本身（豁免即该条款的示例）',
    },
]

/** 持久 ref 形态：commit hash（可带 `~n` / `^n` 相对式）/ tag。 */
export const HASH_RE = /^[0-9a-f]{7,40}([~^]\d*)*$/
export const TAG_RE = /^v?\d+\.\d+(\.\d+)?$/
/** 文档占位符（`<base>` / `<rev>` / `<end>` 等）——示例命令用，允许。 */
export const PLACEHOLDER_RE = /^<[^<>]+>$/
/** `HEAD` 家族：`HEAD` / `HEAD~1` / `HEAD^2` / 简写 `@`。 */
export const HEAD_RE = /^(HEAD([~^]\d*)?|@)$/
/** 带文件扩展名（视作 pathspec，而非 ref）。 */
export const FILE_EXT_RE = /\.[a-z0-9]{1,5}$/i
/** 命令替换 / 变量展开（fail-closed）。 */
export const UNVERIFIABLE_RE = /\$\(|`|\$\{?[A-Za-z_]/
/** 行内分隔符：命令在此截断，避免把管道右侧的 `grep` 误当 git 子命令。 */
const SEPARATOR_RE = /\||&&|;|#/
/** 受检面下界（防静默收窄）。 */
export const MIN_SCANNED_FILES = 200
export const MIN_CODE_LINES = 3000
export const MIN_COMMANDS = 30

const toRel = (file) => relative(REPO_ROOT, file).split('\\').join('/')

function walkMarkdown(dir, acc = []) {
    for (const name of readdirSync(dir)) {
        const path = join(dir, name)
        if (statSync(path).isDirectory()) {
            walkMarkdown(path, acc)
        } else if (name.endsWith('.md')) {
            acc.push(path)
        }
    }
    return acc
}

/**
 * 抽取 markdown 的代码区：围栏代码块内的整行 + 行内代码段。
 * 逐行产出（围栏行本身不计），保证行号可回溯且解析不跨行。
 *
 * @returns {Array<{ line: number, text: string, kind: 'fence' | 'inline' }>}
 */
export function extractCodeRegions(source) {
    const segments = []
    const lines = source.split(/\r?\n/)
    let inFence = false
    lines.forEach((line, index) => {
        if (/^\s*(```|~~~)/.test(line)) {
            inFence = !inFence
            return
        }
        if (inFence) {
            segments.push({ line: index + 1, text: line, kind: 'fence' })
            return
        }
        for (const match of line.matchAll(/`([^`]+)`/g)) {
            segments.push({ line: index + 1, text: match[1], kind: 'inline' })
        }
    })
    return segments
}

/**
 * 引号占位符：把引号内容替换为**占位 token**（而非空串），使取值型 flag 仍能吃到自己的取值，
 * 不会把紧随其后的 revision 误当取值吞掉（R1 W4 修复引入的回归）。
 */
export const QUOTED_PLACEHOLDER = '__caomei_quoted__'

/** 剥离引号内容（替换为占位 token），避免把 `-S'.x'` / `--grep='^feat'` 的参数当 revision。 */
const stripQuoted = (text) => text.replace(/"[^"]*"|'[^']*'/g, QUOTED_PLACEHOLDER)

/**
 * 从代码区行中解析 git 命令。
 *
 * @returns {Array<{ line: number, text: string, sub: string, args: string }>}
 */
export function findGitCommands(segments) {
    const commands = []
    for (const segment of segments) {
        const stripped = stripQuoted(segment.text)
        const match = new RegExp(`git(?:\\s+-{1,2}[^\\s]+(?:\\s+(?!(?:${GIT_SUBCOMMANDS.join('|')})\\b)[^\\s-][^\\s]*)?)*\\s+(${GIT_SUBCOMMANDS.join('|')})\\b`).exec(stripped)
        if (!match) {
            continue
        }
        const tail = stripped.slice(match.index)
        const cut = tail.search(SEPARATOR_RE)
        const text = (cut === -1 ? tail : tail.slice(0, cut)).trim()
        const subcommandOffset = match[0].lastIndexOf(match[1])
        commands.push({
            line: segment.line,
            text,
            sub: match[1],
            args: text.slice(subcommandOffset + match[1].length).trim(),
            // 引号片段连同其**前置 flag** 一起记录：`--grep='HEAD'` 是模式文本，不是 revision
            quoted: [...segment.text.matchAll(/(\S+)\s*("[^"]*"|'[^']*')/g)].map((item) => ({
                value: item[2].slice(1, -1),
                flag: item[1].replace(/[=]+$/, ''),
            })),
        })
    }
    return commands
}

/** 判断单个 revision 令牌是否为持久形态。 */
export function isPersistentRevision(token) {
    return HASH_RE.test(token) || TAG_RE.test(token) || PLACEHOLDER_RE.test(token)
}

/**
 * 取值型 flag（其后的分离取值不是 revision；`-S` / `-G` 的值可能已被引号剥离，故一并登记）。
 */
export const VALUE_FLAGS = new Set([
    '-n', '--max-count', '--skip', '-U', '--unified', '--since', '--until', '--author', '--committer',
    '--grep', '--format', '--pretty', '--date', '--diff-filter', '--word-diff-regex', '-S', '-G',
])

/** 取命令的 revision 候选（单层：`grep` 的首个非 flag 令牌是 pattern，不算 revision）。 */
export function revisionCandidates(sub, args) {
    const tokens = args.split(/\s+/).filter(Boolean)
    const separator = tokens.indexOf('--')
    const head = separator === -1 ? tokens : tokens.slice(0, separator)
    const nonFlags = []
    for (let index = 0; index < head.length; index += 1) {
        const token = head[index]
        if (VALUE_FLAGS.has(token) && head[index + 1] !== undefined && head[index + 1] !== '--') {
            index += 1
            continue
        }
        if (token.startsWith('-')) {
            continue
        }
        nonFlags.push(token)
    }
    return sub === 'grep' ? nonFlags.slice(1) : nonFlags
}

/**
 * 校验一个 revision 令牌（含 `A..B` 范围与 `rev:path` 复合形态）。
 *
 * @returns {{ kind: 'head' | 'non-persistent', token: string } | null}
 */
export function inspectRevisionToken(token, { pathExists } = {}) {
    if (token === QUOTED_PLACEHOLDER) {
        return null // 引号内容：HEAD 由 findQuotedHead 单独检出，其余形态为已知边界
    }
    if (token.startsWith(':')) {
        return null // index 形态（`:path`）
    }
    const compound = /^([^:]+):(.+)$/.exec(token)
    if (compound && !token.includes('//')) {
        return inspectRevisionToken(compound[1], { pathExists })
    }
    if (HEAD_RE.test(token)) {
        return { kind: 'head', token }
    }
    if (/\.\.\.?/.test(token)) {
        for (const part of token.split(/\.\.\.?/)) {
            // 半开区间（`v0.3.0..` / `..b1da270`）的缺省端点是 HEAD：不可复算，按 head 处理
            if (!part) {
                return { kind: 'head', token: `${token}（隐含 HEAD 端点）` }
            }
            if (HEAD_RE.test(part)) {
                return { kind: 'head', token }
            }
            if (!isPersistentRevision(part)) {
                return { kind: 'non-persistent', token }
            }
        }
        return null
    }
    if (isPersistentRevision(token)) {
        return null
    }
    // 含路径分隔符：仅当是仓库内已存在路径或带文件扩展名时按 pathspec；否则按 ref 判定
    if (/[/\\]/.test(token)) {
        if (!pathExists || pathExists(token) || FILE_EXT_RE.test(token)) {
            return null
        }
        return { kind: 'non-persistent', token }
    }
    return { kind: 'non-persistent', token }
}

/**
 * 引号内容中的 HEAD（引号剥离后仍需检出，避免 `git show 'HEAD:x'` 绕过）。
 *
 * 只认「引号整体即 rev 或 `rev:path`」的形态（`HEAD` / `HEAD~1` / `HEAD:x` / `@:x`），
 * 避免把 `--grep='HEAD is banned'` 这类**模式文本**误判；`git grep` 的引号内容默认按 pattern 看待。
 */
export function findQuotedHead(quoted = [], sub) {
    if (sub === 'grep') {
        return null
    }
    for (const entry of quoted) {
        const { value, flag } = typeof entry === 'string' ? { value: entry, flag: '' } : entry
        // 取值型 flag 的引号参数按模式文本看待（`--grep='HEAD'` / `--author='@'`）
        if (VALUE_FLAGS.has(flag)) {
            continue
        }
        if (/^(?:HEAD(?:[~^]\d*)?(?:@\{[^}]+\})?|@(?:\{[^}]+\})?)(?::.*)?$/.test(value.trim())) {
            return value
        }
    }
    return null
}

/** 引号内容中的命令替换 / 变量展开（args 已被剥空，故需在引号内容上再检一次）。 */
export function findQuotedUnverifiable(quoted = []) {
    return quoted.some((entry) => UNVERIFIABLE_RE.test(typeof entry === 'string' ? entry : entry.value))
}

/**
 * 用于**豁免匹配**的路径：仓库内文件用仓库相对路径，其余（受检面构造测试）用受检根相对路径。
 * 修复「fixture 根下豁免恒不匹配 → 反向校验按错误理由通过」这一测试假象。
 */
function pathForMatch(file, root) {
    const repoRelative = toRel(file)
    return repoRelative.startsWith('..') ? relative(root, file).split('\\').join('/') : repoRelative
}

function isExempt(file, text, exemptions = EXEMPT_COMMANDS) {
    return exemptions.some((entry) => entry.file === file && entry.pattern.test(text))
}

/** 扫描单份 md，返回违规与命中统计。 */
export function scanDocument(file, source, { exemptions = EXEMPT_COMMANDS, pathExists, root } = {}) {
    const commands = findGitCommands(extractCodeRegions(source))
    const violations = []

    for (const command of commands) {
        if (isExempt(pathForMatch(file, root ?? dirname(file)), command.text, exemptions)) {
            continue
        }
        const quotedHead = findQuotedHead(command.quoted, command.sub)
        if (quotedHead) {
            violations.push({
                file: toRel(file),
                line: command.line,
                type: 'head-revision',
                text: command.text,
                token: quotedHead,
            })
            continue
        }
        if (UNVERIFIABLE_RE.test(stripQuoted(command.args)) || findQuotedUnverifiable(command.quoted)) {
            violations.push({
                file: toRel(file),
                line: command.line,
                type: 'unverifiable-shape',
                text: command.text,
            })
            continue
        }
        for (const candidate of revisionCandidates(command.sub, command.args)) {
            const issue = inspectRevisionToken(candidate, { pathExists })
            if (issue) {
                violations.push({
                    file: toRel(file),
                    line: command.line,
                    type: issue.kind === 'head' ? 'head-revision' : 'non-persistent-revision',
                    text: command.text,
                    token: issue.token,
                })
            }
        }
    }

    return { commands, violations }
}

/** 把违规转为可读消息（避免嵌套三元）。 */
function describeViolation(hit) {
    if (hit.type === 'head-revision') {
        return `revision 位出现 HEAD（\`${hit.token}\`）：提交落地后结论不可复算，须钉持久 ref（commit hash / tag / \`<base>..<end>\`）`
    }
    if (hit.type === 'unverifiable-shape') {
        return '命令含命令替换 / 变量展开，无法静态判定 revision：须改写为可复算的显式形态'
    }
    return `revision「${hit.token}」非持久形态：须钉 commit hash / tag / \`<base>..<end>\` / 占位符`
}

/**
 * 执行校验，返回 `{ ok, errors, details }`。
 *
 * @param {string} root 受检 md 根目录
 * @param {{ exemptions?: Array<object>, bounds?: { files: number, codeLines: number, commands: number } }} [options]
 *   豁免清单与受检面下界（合成受检面测试用；缺省取仓库值）
 */
export function checkDocsGitRevision(root = DOCS_DIR, { exemptions = EXEMPT_COMMANDS, bounds } = {}) {
    const limits = { files: MIN_SCANNED_FILES, codeLines: MIN_CODE_LINES, commands: MIN_COMMANDS, ...bounds }
    const files = walkMarkdown(root)
    const errors = []
    const counts = { files: files.length, codeLines: 0, commands: 0 }
    const hits = []

    for (const file of files) {
        const source = readFileSync(file, 'utf8')
        counts.codeLines += extractCodeRegions(source).length
        const { commands, violations } = scanDocument(file, source, {
            exemptions,
            pathExists: (rel) => existsSync(join(REPO_ROOT, rel)),
            root,
        })
        counts.commands += commands.length
        for (const violation of violations) {
            hits.push(violation)
        }
    }

    for (const hit of hits) {
        errors.push(`${hit.file}:${hit.line} [${hit.type}] ${describeViolation(hit)}｜命令：\`${hit.text}\``)
    }

    // T4 豁免清单反向校验
    const matched = exemptions.map(() => 0)
    for (const file of files) {
        for (const command of findGitCommands(extractCodeRegions(readFileSync(file, 'utf8')))) {
            const matchPath = pathForMatch(file, root)
            exemptions.forEach((entry, index) => {
                if (entry.file === matchPath && entry.pattern.test(command.text)) {
                    matched[index] += 1
                }
            })
        }
    }
    exemptions.forEach((entry, index) => {
        if (matched[index] === 0) {
            errors.push(`豁免项 ${entry.file} ${entry.pattern} 不再命中任何命令：请移除该豁免（防永久豁免）`)
        }
    })

    // T5 受检面下界
    if (counts.files < limits.files) {
        errors.push(`受检 md 文件数 ${counts.files} 低于下界 ${limits.files}：怀疑受检面被静默收窄`)
    }
    if (counts.codeLines < limits.codeLines) {
        errors.push(`代码区行数 ${counts.codeLines} 低于下界 ${limits.codeLines}：怀疑受检面被静默收窄`)
    }
    if (counts.commands < limits.commands) {
        errors.push(`命中命令数 ${counts.commands} 低于下界 ${limits.commands}：怀疑受检面被静默收窄`)
    }

    return { ok: errors.length === 0, errors, details: { ...counts, exemptions: matched } }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkDocsGitRevision()
    if (result.ok) {
        console.info(
            `[check-docs-git-revision] 通过：${result.details.files} md / ${result.details.codeLines} 代码区行 / `
            + `${result.details.commands} 条 git 取证命令，revision 均已钉持久 ref`,
        )
        process.exit(0)
    }
    for (const error of result.errors) {
        console.error(`[check-docs-git-revision][error] ${error}`)
    }
    process.exit(1)
}
