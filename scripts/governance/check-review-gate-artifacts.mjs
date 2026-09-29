#!/usr/bin/env node

/**
 * check-review-gate-artifacts：Review Gate 落盘**阻断**守卫（本地态）。
 *
 * 设计依据（见 docs/design/governance/2026-09-28-m3-governance-guards.md §3）：
 * - `artifacts/` 被 `.gitignore` 排除、**仅本地留存**（D6），故本守卫只用于**本地提交流程**；
 *   在 CI 中 `artifacts/` 不存在，若强行阻断会必然误报——因此 CI（`CI` 环境变量）与
 *   工件目录缺失时**跳过**（exit 0 并打印跳过原因）。
 * - 阻断规则：本批次（受检范围 = 暂存文件）必须存在**足够新鲜**的 Review Gate 工件——
 *   工件 mtime 不早于受检范围内最新的文件 mtime（工件应在代码冻结、审计完成后写入）。
 *   范围为空（如 CI 洁净检出 / 空提交）时跳过。
 * - **发布元数据豁免**：范围仅是清单文件（`package.json` 等）的**版本号字段单行变更**时跳过——
 *   `npm version` / `pnpm version` 会在改写版本号后直接提交，刷新文件 mtime 使新鲜度判定必然
 *   失败；该改动不含需审计的代码。判定取暂存 diff 的增删内容行，必须**全部**为
 *   `"version": "…"` 形态（见 `isVersionOnlyBatch`），任一其它改动行即恢复阻断。
 *
 * 用法：
 *   node scripts/governance/check-review-gate-artifacts.mjs            # 取 git 暂存文件为范围
 *   node scripts/governance/check-review-gate-artifacts.mjs --scope a b # 显式指定范围（测试用）
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const ARTIFACTS_DIR = 'artifacts/review-gate'

/** 不作为「本批次工件」计的文件（装置说明）。 */
export const NON_RECORD_FILES = new Set(['README.md'])

/**
 * 允许「仅版本号变更」豁免的发布元数据文件名（`npm version` / `pnpm version` 的改写目标）。
 * 按 basename 匹配；仓库当前为单包，未使用 package-lock.json，但一并登记以覆盖采用 npm 锁文件的形态。
 */
export const VERSION_METADATA_FILES = new Set(['package.json', 'package-lock.json', 'npm-shrinkwrap.json'])

/** 仅匹配清单中 `"version": "<值>"` 形态的增删行（允许缩进与尾随逗号）。 */
const VERSION_FIELD_LINE_RE = /^\s*"version"\s*:\s*"[^"]*"\s*,?\s*$/

/**
 * 解析命令行参数。
 *
 * @param {string[]} argv 参数列表（不含 node / 脚本名）
 * @returns {{ root: string | null, scope: string[] | null, error: string | null }}
 */
export function parseArgs(argv) {
    let root = null
    const scope = []
    for (let i = 0; i < argv.length; i += 1) {
        if (argv[i] === '--root') {
            root = argv[i + 1] ?? null
            i += 1
        } else if (argv[i] === '--scope') {
            let j = i + 1
            while (j < argv.length && !argv[j].startsWith('--')) {
                scope.push(argv[j])
                j += 1
            }
            i = j - 1
        } else if (argv[i].startsWith('--')) {
            return { root: null, scope: null, error: `不支持的参数：${argv[i]}` }
        } else {
            return { root: null, scope: null, error: `未知位置参数：${argv[i]}` }
        }
    }
    return { root, scope: scope.length > 0 ? scope : null, error: null }
}

/**
 * 取 git 暂存文件作为默认受检范围（排除删除项）。
 *
 * @param {string} root 仓库根
 * @returns {string[]}
 */
export function stagedScope(root = projectRoot) {
    const result = spawnSync('git', ['diff', '--cached', '--name-only', '--diff-filter=ACMR'], {
        cwd: root,
        encoding: 'utf8',
    })
    if (result.status !== 0) {
        return []
    }
    return result.stdout.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
}

/**
 * 取单个文件暂存 diff 的纯内容增删行（剥离 `+` / `-` 前缀）。
 *
 * 只统计 hunk 体内的增删行：进入 `@@` 后才开始采集，遇 `diff --git` 复位。
 * 这样文件头 `--- a/…` / `+++ b/…` 与 `\ No newline` 等非内容行天然不入选，
 * 也不会误丢以 `++` / `--` 开头的**真实内容行**。
 *
 * 已知边界：`old mode` / `new mode` 等非内容型变更不产生增删行，故不可见。
 *
 * @param {string} root 仓库根
 * @param {string} file 仓库相对路径
 * @returns {string[] | null} 增删内容行；git 命令失败时返回 null
 */
function stagedContentLines(root, file) {
    const result = spawnSync('git', ['diff', '--cached', '--unified=0', '--', file], {
        cwd: root,
        encoding: 'utf8',
    })
    if (result.status !== 0) {
        return null
    }
    const changed = []
    let inHunk = false
    for (const line of result.stdout.split(/\r?\n/)) {
        if (line.startsWith('diff --git ')) {
            inHunk = false
        } else if (line.startsWith('@@')) {
            inHunk = true
        } else if (inHunk && (line.startsWith('+') || line.startsWith('-'))) {
            changed.push(line.slice(1))
        }
    }
    return changed
}

/**
 * 取全量暂存条目（含删除 / 重命名），用于确认豁免判定覆盖整个暂存集。
 *
 * @param {string} root 仓库根
 * @returns {Array<{ status: string, path: string }> | null} 失败时返回 null
 */
function stagedEntries(root) {
    const result = spawnSync('git', ['diff', '--cached', '--name-status'], { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) {
        return null
    }
    return result.stdout
        .split(/\r?\n/)
        .filter(Boolean)
        .map((line) => {
            const [status, ...paths] = line.split('\t')
            return { status: status.trim(), path: paths.join('\t') }
        })
}

/**
 * 判定受检范围是否全部为「仅版本号变更」的发布元数据改动。
 *
 * 保守口径（三重要求全部满足才豁免）：
 * 1. 范围非空，且每个文件都是 `VERSION_METADATA_FILES` 中的清单文件；
 * 2. 范围等于**全量暂存集**（含删除 / 重命名），且每条暂存状态都是 `M`——
 *    避免「删除代码 + 版本号 bump」被默认范围（`--diff-filter=ACMR` 排除 D）误判为纯版本号；
 * 3. 每个文件的暂存 diff 增删内容行**全部**为 `"version": "…"` 形态。
 *
 * 任一不满足即返回 false（维持阻断），因此无法借该豁免夹带代码 / 依赖 / 脚本改动。
 *
 * @param {string[]} scope 受检范围（仓库相对路径）
 * @param {string} [root] 仓库根
 * @returns {boolean}
 */
export function isVersionOnlyBatch(scope, root = projectRoot) {
    if (scope.length === 0) {
        return false
    }
    if (!scope.every((file) => VERSION_METADATA_FILES.has(basename(file)))) {
        return false
    }
    const entries = stagedEntries(root)
    if (entries === null || entries.length !== scope.length) {
        return false
    }
    const scopeSet = new Set(scope)
    if (!entries.every((entry) => entry.status === 'M' && scopeSet.has(entry.path))) {
        return false
    }
    return entries.every((entry) => {
        const changed = stagedContentLines(root, entry.path)
        return changed !== null && changed.length > 0 && changed.every((line) => VERSION_FIELD_LINE_RE.test(line))
    })
}

/**
 * 判定是否应跳过（本地态缺失 / CI / 空范围）。
 *
 * @param {{ root?: string, scope?: string[], ci?: boolean }} options
 * @returns {{ skip: boolean, reason: string | null }}
 */
export function resolveSkip(options = {}) {
    const root = options.root ?? projectRoot
    if (options.ci ?? Boolean(process.env.CI)) {
        return { skip: true, reason: 'CI 环境（工件为本地态，不阻断）' }
    }
    if (!existsSync(join(root, ARTIFACTS_DIR))) {
        return { skip: true, reason: `工件目录不存在（${ARTIFACTS_DIR}）` }
    }
    const scope = options.scope ?? stagedScope(root)
    if (scope.length === 0) {
        return { skip: true, reason: '受检范围为空（无暂存文件）' }
    }
    if (isVersionOnlyBatch(scope, root)) {
        return { skip: true, reason: '受检范围仅为版本号变更（发布元数据，非代码改动）' }
    }
    return { skip: false, reason: null }
}

/**
 * 检查本批次是否存在足够新鲜的 Review Gate 工件。
 *
 * @param {{ root?: string, scope?: string[], ci?: boolean }} [options]
 * @returns {{ skipped: boolean, reason: string | null, issues: string[], scope: string[], artifacts: number }}
 */
export function checkReviewGateArtifacts(options = {}) {
    const root = options.root ?? projectRoot
    const { skip, reason } = resolveSkip({ ...options, root })
    const scope = options.scope ?? stagedScope(root)
    if (skip) {
        return { skipped: true, reason, issues: [], scope, artifacts: 0 }
    }

    const dir = join(root, ARTIFACTS_DIR)
    const records = readdirSync(dir).filter((name) => name.endsWith('.md') && !NON_RECORD_FILES.has(name))
    const scopedMtimes = scope
        .map((file) => join(root, file))
        .filter((file) => existsSync(file))
        .map((file) => statSync(file).mtimeMs)
    const maxScopedMtime = scopedMtimes.length > 0 ? Math.max(...scopedMtimes) : 0

    const fresh = records.filter((name) => statSync(join(dir, name)).mtimeMs >= maxScopedMtime)

    const issues = []
    if (scope.length > 0 && scopedMtimes.length === 0) {
        issues.push(
            `受检范围（${scope.length} 文件）在磁盘上均不存在：无法校验工件新鲜度，按缺件处理（如文件已在工作区删除）`,
        )
    } else if (records.length === 0) {
        issues.push(`本批次缺少 Review Gate 工件：${ARTIFACTS_DIR}/ 下没有任何记录（应为审计产出落盘）`)
    } else if (fresh.length === 0) {
        issues.push(
            `本批次缺少**新鲜**的 Review Gate 工件：${records.length} 份记录的 mtime 均早于受检范围最新文件（工件应在审计完成后写入）`,
        )
    }
    return { skipped: false, reason: null, issues, scope, artifacts: fresh.length }
}

export function main() {
    const { root, scope: explicitScope, error } = parseArgs(process.argv.slice(2))
    if (error) {
        process.stderr.write(`[check-review-gate-artifacts] ${error}\n`)
        process.exitCode = 1
        return
    }
    const options = { root: root ?? projectRoot }
    if (explicitScope) {
        options.scope = explicitScope
    }
    const result = checkReviewGateArtifacts(options)
    if (result.skipped) {
        process.stdout.write(`[check-review-gate-artifacts] 跳过：${result.reason}\n`)
        return
    }
    if (result.issues.length > 0) {
        for (const issue of result.issues) {
            process.stderr.write(`[check-review-gate-artifacts] ${issue}\n`)
        }
        process.stderr.write(`  受检范围（${result.scope.length} 文件）：${result.scope.slice(0, 5).join(', ')}${result.scope.length > 5 ? ' …' : ''}\n`)
        process.stderr.write('  修复方向：由 @code-reviewer 产出记录并落盘到 artifacts/review-gate/ 后再提交\n')
        process.exitCode = 1
        return
    }
    process.stdout.write(`[check-review-gate-artifacts] OK：本批次存在新鲜工件（受检 ${result.scope.length} 文件 / 新鲜工件 ${result.artifacts} 份）\n`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
