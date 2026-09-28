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
 *
 * 用法：
 *   node scripts/governance/check-review-gate-artifacts.mjs            # 取 git 暂存文件为范围
 *   node scripts/governance/check-review-gate-artifacts.mjs --scope a b # 显式指定范围（测试用）
 */
import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const ARTIFACTS_DIR = 'artifacts/review-gate'

/** 不作为「本批次工件」计的文件（装置说明）。 */
export const NON_RECORD_FILES = new Set(['README.md'])

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
