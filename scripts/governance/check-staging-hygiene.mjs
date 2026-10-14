#!/usr/bin/env node

/**
 * check-staging-hygiene：暂存区卫生守卫（**提交路径**，与 `check-review-gate-artifacts` 同层）。
 *
 * 为什么需要它：治理记录 / 记录的计数与修复点以**索引版**（`git show :<file>`）为准，
 * 「改完未 `git add`」会让 Review Gate 读到旧快照——该形态曾在一次下游兼容检查记录批次里被判为
 * blocker（候选来源见 `docs/design/governance/2026-10-13-phase23-m2-1-downstream-compat-explicit-version-run.md`，
 * 执行面与条目状态见 `docs/plan/todo.md`）。该规则文本原先只存在于
 * `docs/standards/ai-collaboration.md §9`（Review Gate 必查），本守卫为其**机检载体**。
 *
 * 判别规则（受检面 = `git status --porcelain=v1 -z` 的全部条目）：
 * - T1 `git-error`——`git status` 执行失败（fail-closed，不得静默放行）；
 * - T2 `malformed-entry`——条目形态不可解析（如不足 2 个状态字符 / 路径为空），
 *   使「无法解析 ⇒ 读不到问题 ⇒ 静默通过」不至于发生；
 * - T3 `partial-stage`——**同一文件既有暂存又有未暂存改动**（X ∉ {` `, `?`, `!`} 且 Y ∉ {` `, `?`, `!`}），
 *   覆盖 `AM` / `MM` / `RM` / `MD` / `AD` / `TD` 等全部组合；`??`（未跟踪）不在面内；
 * - T4 `scope-narrowed`——已暂存范围非空，但解析出的状态条目数低于下界 `SCOPE_FLOOR.entries`（防静默收窄）；
 * - T5 `staged-surface-incomplete`——某个**已暂存文件**未出现在解析出的状态条目中（守卫读面不足，
 *   比 T4 的下界更精确；二者都只在守卫被削弱时触发）；
 * - T6 `unmerged`——状态位组合属未合并族（`DD` / `AU` / `UD` / `UA` / `DU` / `AA` / `UU`）。与 T3 的风险不同源
 *   （不是「读旧快照」而是「提交被拒」），故单列一码而非并入 T3 的文案；`AA` / `DD` 不含 `U` 位，
 *   按**组合**而非单一位判定（本批 R1 的 A-S2）。
 *
 * 跳过条件：**已暂存范围为空**（如 `git commit --allow-empty`）——无暂存内容即无卫生面，打印原因后 exit 0。
 *
 * 用法：
 *   node scripts/governance/check-staging-hygiene.mjs             # 受检当前仓库；有问题 exit 1
 *   node scripts/governance/check-staging-hygiene.mjs --root <dir>
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/**
 * 受检面下界（防静默收窄）。
 *
 * 语义：**已暂存范围非空**时，解析出的状态条目数不得低于该值。正常提交路径下暂存集非空
 * 必然在 `git status` 中至少产生 1 条条目，故下界取 1；若解析结果为 0，说明守卫的输出解析
 * 被削弱（如 git 输出格式漂移未被适配），按失败处理而非静默通过。
 */
export const SCOPE_FLOOR = { entries: 1 }

/** 供机器读取的失败码全集（单测据此断言，避免用字符串散落比对）。 */
export const ISSUE_CODES = {
    gitError: 'git-error',
    malformedEntry: 'malformed-entry',
    partialStage: 'partial-stage',
    unmerged: 'unmerged',
    scopeNarrowed: 'scope-narrowed',
    stagedSurfaceIncomplete: 'staged-surface-incomplete',
}

/** 既不在索引、也不在工作区的状态位（未跟踪 `?` / 忽略 `!`）。 */
const NON_CHANGE_STATUS = new Set([' ', '?', '!'])

/** 未合并（冲突）状态组合；与「索引 ≠ 工作区」的读旧快照风险不同源，故单列一码。 */
const UNMERGED_PAIR_CODES = new Set(['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU'])

/** 会产生**第二条** NUL 分隔路径（原路径）的索引状态位。 */
const RENAME_STATUS = new Set(['R', 'C'])

/**
 * 解析 `git status --porcelain=v1 -z` 的输出。
 *
 * `-z` 形态为 `XY <path>\0`；当索引状态位为 `R`（重命名）/ `C`（复制）时，其后**紧接**
 * 一个额外的 NUL 分隔 token（原路径），须一并跳过。`-z` 不对路径做引号转义。
 *
 * @param {string} stdout 命令输出
 * @returns {{ entries: Array<{ x: string, y: string, path: string }>, malformed: string[] }}
 */
export function parseStatusZ(stdout) {
    const parts = stdout.split('\0')
    const entries = []
    const malformed = []
    for (let i = 0; i < parts.length; i += 1) {
        const token = parts[i]
        if (token === '') {
            continue
        }
        if (token.length < 4 || token[2] !== ' ') {
            malformed.push(token)
            continue
        }
        const x = token[0]
        const y = token[1]
        const path = token.slice(3)
        if (path === '') {
            malformed.push(token)
            continue
        }
        entries.push({ x, y, path })
        if (RENAME_STATUS.has(x) || RENAME_STATUS.has(y)) {
            i += 1
        }
    }
    return { entries, malformed }
}

/**
 * 取索引相对 HEAD 的变更路径列表（**含删除**；不含 `--diff-filter`，以免把「仅类型变更」等
 * 罕见形态误判为「暂存范围为空」而跳过）。
 *
 * @param {string} root 仓库根
 * @returns {string[] | null} git 失败时返回 null
 */
export function readStagedPaths(root) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only', '-z'], {
        cwd: root,
        encoding: 'utf8',
    })
    if (result.status !== 0) {
        return null
    }
    return result.stdout.split('\0').filter(Boolean)
}

/**
 * 取 `git status --porcelain=v1 -z` 的原始输出。
 *
 * @param {string} root 仓库根
 * @returns {string | null} git 失败时返回 null
 */
export function readStatusZ(root) {
    const result = spawnSync('git', ['status', '--porcelain=v1', '-z'], { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) {
        return null
    }
    return result.stdout
}

/**
 * 纯判定层：由「已暂存路径 + 状态输出」得出问题清单（不触碰文件系统，便于单测直接驱动）。
 *
 * @param {{
 *   stagedPaths: string[],
 *   statusOut: string,
 *   enforceScope?: boolean,
 *   floor?: { entries: number },
 * }} input
 * @returns {{
 *   checked: number,
 *   entries: Array<{ x: string, y: string, path: string }>,
 *   issues: Array<{ code: string, detail: string }>,
 * }}
 */
export function inspectStatus({ stagedPaths, statusOut, enforceScope = true, floor = SCOPE_FLOOR }) {
    const { entries, malformed } = parseStatusZ(statusOut)
    const issues = []

    for (const token of malformed) {
        issues.push({ code: ISSUE_CODES.malformedEntry, detail: `无法解析的状态条目：${JSON.stringify(token)}` })
    }

    for (const entry of entries) {
        if (UNMERGED_PAIR_CODES.has(`${entry.x}${entry.y}`)) {
            issues.push({
                code: ISSUE_CODES.unmerged,
                detail: `${entry.x}${entry.y} ${entry.path}（存在未合并冲突：请先解决冲突再提交）`,
            })
            continue
        }
        if (NON_CHANGE_STATUS.has(entry.x) || NON_CHANGE_STATUS.has(entry.y)) {
            continue
        }
        issues.push({
            code: ISSUE_CODES.partialStage,
            detail: `${entry.x}${entry.y} ${entry.path}（索引与工作区同时有改动：请 \`git add\` 后再提交）`,
        })
    }

    if (enforceScope) {
        if (entries.length < floor.entries) {
            issues.push({
                code: ISSUE_CODES.scopeNarrowed,
                detail: `解析出的状态条目 ${entries.length} 低于下界 ${floor.entries}（守卫读面不足；已暂存 ${stagedPaths.length} 文件）`,
            })
        }
        const surface = new Set(entries.map((entry) => entry.path))
        for (const path of stagedPaths) {
            if (!surface.has(path)) {
                issues.push({
                    code: ISSUE_CODES.stagedSurfaceIncomplete,
                    detail: `已暂存文件未出现在状态条目中：${path}`,
                })
            }
        }
    }

    return { checked: entries.length, entries, issues }
}

/**
 * 校验暂存区卫生。
 *
 * @param {string} root 仓库根
 * @param {{ enforceScope?: boolean }} [options]
 * @returns {{
 *   skipped: boolean,
 *   reason: string | null,
 *   checked: number,
 *   entries: Array<{ x: string, y: string, path: string }>,
 *   issues: Array<{ code: string, detail: string }>,
 * }}
 */
export function checkStagingHygiene(root, { enforceScope = true } = {}) {
    const stagedPaths = readStagedPaths(root)
    if (stagedPaths === null) {
        return {
            skipped: false,
            reason: null,
            checked: 0,
            entries: [],
            issues: [{ code: ISSUE_CODES.gitError, detail: 'git diff --cached --name-only 执行失败' }],
        }
    }
    if (stagedPaths.length === 0) {
        return {
            skipped: true,
            reason: '已暂存范围为空（无暂存内容即无卫生面）',
            checked: 0,
            entries: [],
            issues: [],
        }
    }

    const statusOut = readStatusZ(root)
    if (statusOut === null) {
        return {
            skipped: false,
            reason: null,
            checked: 0,
            entries: [],
            issues: [{ code: ISSUE_CODES.gitError, detail: 'git status --porcelain 执行失败' }],
        }
    }

    const { checked, entries, issues } = inspectStatus({ stagedPaths, statusOut, enforceScope })
    return { skipped: false, reason: null, checked, entries, issues }
}

export function main(argv = process.argv.slice(2)) {
    let root = REPO_ROOT
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-staging-hygiene] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-staging-hygiene] 目标目录不存在：${root}`)
        return 2
    }

    const result = checkStagingHygiene(root)
    if (result.skipped) {
        console.info(`[check-staging-hygiene] 跳过：${result.reason}`)
        return 0
    }
    if (result.issues.length > 0) {
        for (const issue of result.issues) {
            console.error(`[check-staging-hygiene][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-staging-hygiene] ${result.issues.length} 处问题（受检 ${result.checked} 条目）`)
        return 1
    }
    console.info(`[check-staging-hygiene] OK：受检 ${result.checked} 个状态条目，无「既有暂存又有未暂存改动」`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
