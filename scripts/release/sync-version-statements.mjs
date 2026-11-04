#!/usr/bin/env node

/**
 * sync-version-statements：在 semantic-release 的 `prepare` 阶段同步「当前版本」声明句。
 *
 * 为什么需要它：semantic-release 只提交 `CHANGELOG.md` + `package.json`，不维护 README（中英）与
 * `docs/plan/roadmap.md` 的「当前版本」句；不在发布提交里同步，发布后 `docs:check:version` 会立即红灯。
 *
 * 执行顺序：本脚本由 `@semantic-release/exec` 的 `prepareCmd` 调用，位于 `@semantic-release/npm`
 * （已 bump `package.json`）之后、`@semantic-release/git`（提交 assets）之前。
 *
 * 用法：
 *   node scripts/release/sync-version-statements.mjs --version=1.1.0
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'
import { CURRENT_VERSION_STATEMENTS, planVersionStatementSync, statementFiles } from '../shared/version-statements.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        values: { '--version': { key: 'version' } },
    })
}

export function validateVersion(version) {
    if (!version) {
        throw new Error('缺少 --version（期望 semver，如 1.1.0）')
    }
    if (!VERSION_PATTERN.test(version)) {
        throw new Error(`Invalid --version: ${version}（期望 semver，如 1.1.0）`)
    }
    return version
}

/**
 * 同步版本句并校验；返回被改写的文件。
 *
 * @param {{ version: string, root?: string }} options
 * @returns {string[]} 改写的文件（仓库相对路径）
 */
export function syncVersionStatements({ version, root = REPO_ROOT }) {
    validateVersion(version)
    const entries = statementFiles(CURRENT_VERSION_STATEMENTS)
        .filter((file) => existsSync(resolve(root, file)))
        .map((file) => ({ file, content: readFileSync(resolve(root, file), 'utf8') }))

    const planned = planVersionStatementSync(entries, version, CURRENT_VERSION_STATEMENTS)
    const missing = planned.filter((item) => !item.matched).map((item) => item.file)
    if (missing.length > 0) {
        throw new Error(`以下文件未匹配到「当前版本」声明句锚点（句式是否被改写？）：${missing.join(' / ')}`)
    }

    // roadmap 的版本句必须独立成句：若同一行还挂着发布日期或「下一目标版本」，同步后会产生
    // 「发布日期仍是旧值 / 下一目标等于刚发布版本」的矛盾文案（守卫只校验 token，不会发现）。
    const roadmapFile = CURRENT_VERSION_STATEMENTS.find((statement) => statement.file.endsWith('roadmap.md'))?.file
    const roadmap = roadmapFile ? planned.find((item) => item.file === roadmapFile) : undefined
    if (roadmap) {
        const line = roadmap.content
            .split(/\r?\n/u)
            .find((candidate) => candidate.includes(`当前版本 \`${version}\``))
        if (line && (/\d{4}-\d{2}-\d{2}/u.test(line) || line.includes('下一目标版本'))) {
            throw new Error('roadmap 的「当前版本」句不得与发布日期 / 下一目标版本同句；请拆分为独立句子')
        }
    }

    const changed = planned.filter((item) => item.changed)
    for (const item of changed) {
        writeFileSync(resolve(root, item.file), item.content, 'utf8')
    }
    return changed.map((item) => item.file)
}

async function main() {
    const options = parseArgs()
    const changed = syncVersionStatements(options)
    process.stdout.write(`[sync-version-statements] ${changed.length > 0 ? `已更新 ${changed.join(' / ')}` : '版本句已是目标版本'}\n`)

    const result = spawnSync('pnpm', ['docs:check:version'], { cwd: REPO_ROOT, stdio: 'inherit' })
    if (result.status !== 0) {
        throw new Error('docs:check:version 未通过，拒绝进入发布提交')
    }
}

if (isDirectExecution(import.meta.url)) {
    main().catch((error) => {
        process.stderr.write(`[sync-version-statements] ${error.message}\n`)
        process.exitCode = 1
    })
}
