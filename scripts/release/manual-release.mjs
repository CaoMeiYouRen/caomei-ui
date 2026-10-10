#!/usr/bin/env node

/**
 * manual-release：统一手动发布流的**单入口编排**。
 *
 * 背景：本地手动发布此前由 5 个命令跨 3 个工具（`npm version` / `pnpm changelog` /
 * `npm publish` / `gh release create`）靠人工记忆串联，痛点 = 隐式前置（清单末尾换行等格式
 * 不变量）、后置文档同步易漏、tag 落点歧义、GitHub Release 手工。本脚本把「前置门 → 版本
 * → CHANGELOG → 发布 → 后校验 → 版本句同步 → GitHub Release」串成一条可复算流程。
 *
 * 设计约束：
 * - **不引入新依赖**（仅 node 内建 + 本仓既有脚本 / `npm` / `gh` / `git` CLI）。
 * - **保持发布批次纯净**：版本步骤只动 `package.json` 的版本行、CHANGELOG 步骤只动
 *   `CHANGELOG.md`，二者分两次提交以命中 `check-review-gate-artifacts` 的发布元数据豁免。
 * - **不自动 push**：仓库规范禁止自动推送，脚本在 `announce` 后提示由用户推送。
 * - **不改写历史叙述**：版本句同步只锚定「当前版本」句式，不触碰历史版本叙述。
 *
 * 用法（须在仓库根运行）：
 *   node scripts/release/manual-release.mjs preflight --version=0.7.0
 *   node scripts/release/manual-release.mjs run --version=0.7.0 [--date=YYYY-MM-DD] [--yes] [--dry-run]
 *   pnpm release:manual <step> --version=<v>
 * steps：preflight | bump | changelog | publish | verify | sync | announce | run
 *
 * 变更型步骤（bump / changelog / publish / sync / announce）**必须显式给出 `--yes`**
 * （或以 `--dry-run` 预览），避免误触发不可逆动作。
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { isDirectExecution } from '../shared/cli.mjs'
import { CURRENT_VERSION_STATEMENTS, statementFiles } from '../shared/version-statements.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
export const PACKAGE_NAME = 'caomei-ui'
export const RELEASE_BRANCH = 'master'

/** 全流程步骤（顺序即执行顺序）。 */
export const STEPS = ['preflight', 'bump', 'changelog', 'publish', 'verify', 'sync', 'announce']

/** 改动仓库状态的步骤：须显式 `--yes` 或 `--dry-run`。 */
export const MUTATING_STEPS = new Set(['bump', 'changelog', 'publish', 'sync', 'announce'])

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u

const USAGE = `用法：node scripts/release/manual-release.mjs <step> --version=<v> [--date=YYYY-MM-DD] [--yes] [--dry-run]
steps：${STEPS.join(' | ')} | run
  --version  目标版本（semver，如 0.7.0）
  --date     可选，固定 CHANGELOG 发布日期（YYYY-MM-DD）
  --yes      确认执行变更型步骤（非交互环境必须显式给出）
  --dry-run  只打印计划动作，不落盘 / 不改 git / 不发布`

/**
 * 解析命令行参数。
 *
 * @param {string[]} argv 参数列表（不含 node / 脚本名）
 * @returns {{ step: string, version: string | undefined, date: string | undefined, yes: boolean, dryRun: boolean, error: string | null }}
 */
export function parseArgs(argv) {
    let step = null
    let version
    let date
    let yes = false
    let dryRun = false
    const unknown = (error) => ({ step: '', version, date, yes, dryRun, error })
    for (const arg of argv) {
        if (arg === '--yes') {
            yes = true
        } else if (arg === '--dry-run') {
            dryRun = true
        } else if (arg.startsWith('--version=')) {
            version = arg.slice('--version='.length)
        } else if (arg.startsWith('--date=')) {
            date = arg.slice('--date='.length)
        } else if (arg.startsWith('--')) {
            return unknown(`不支持的参数：${arg}`)
        } else if (step === null) {
            step = arg
        } else {
            return unknown(`未知位置参数：${arg}`)
        }
    }
    if (!step) {
        return unknown('缺少 step')
    }
    if (![...STEPS, 'run'].includes(step)) {
        return unknown(`未知 step：${step}（可用：${[...STEPS, 'run'].join(' | ')}）`)
    }
    return { step, version, date, yes, dryRun, error: null }
}

/**
 * 校验版本号（所有步骤均需）。
 *
 * @param {string | undefined} version
 * @returns {string} 校验通过的版本号
 */
export function validateVersion(version) {
    if (!version) {
        throw new Error('缺少 --version（期望 semver，如 0.7.0）')
    }
    if (!VERSION_PATTERN.test(version)) {
        throw new Error(`Invalid --version: ${version}（期望 semver，如 0.7.0）`)
    }
    return version
}

/**
 * 校验 `--date` 形态。
 *
 * @param {string | undefined} date
 * @returns {string | undefined}
 */
export function validateDate(date) {
    if (date !== undefined && !DATE_PATTERN.test(date)) {
        throw new Error(`Invalid --date: ${date}（期望 YYYY-MM-DD）`)
    }
    return date
}

/**
 * 从 CHANGELOG 文本抽取某版本的段落正文（不含版本标题行）。
 *
 * 结构：`# caomei-ui` → `# Unreleased (date)` → `# [x.y.z](url) (date)` → 正文（到下一个 `# ` 为止）。
 *
 * @param {string} changelog CHANGELOG 全文
 * @param {string} version 目标版本
 * @returns {string | null} 段落正文（已 trim）；未找到返回 null
 */
export function extractChangelogSection(changelog, version) {
    const escaped = version.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')
    const heading = new RegExp(`^#\\s+\\[?${escaped}\\]?(?![\\d.])`, 'u')
    const lines = changelog.split(/\r?\n/u)
    const start = lines.findIndex((line) => heading.test(line))
    if (start === -1) {
        return null
    }
    const body = []
    for (let i = start + 1; i < lines.length; i += 1) {
        if (/^#\s+/u.test(lines[i])) {
            break
        }
        body.push(lines[i])
    }
    return body.join('\n').trim() || null
}

/**
 * 在**单个**声明句内替换版本号（句内首个捕获组即版本）。
 *
 * @param {string} content 文件内容
 * @param {RegExp} pattern 声明句锚点（含 1 个捕获组）
 * @param {string} version 目标版本
 * @returns {{ content: string, changed: boolean, matched: boolean }}
 */
export function replaceVersionInStatement(content, pattern, version) {
    const match = pattern.exec(content)
    if (!match) {
        return { content, changed: false, matched: false }
    }
    if (match[1] === version) {
        return { content, changed: false, matched: true }
    }
    const replaced = match[0].replace(match[1], version)
    return {
        content: content.slice(0, match.index) + replaced + content.slice(match.index + match[0].length),
        changed: true,
        matched: true,
    }
}

/**
 * 规划版本句同步（纯函数）：对每个文件的全部命中锚点做替换。
 *
 * @param {Array<{ file: string, content: string }>} entries 文件内容
 * @param {string} version 目标版本
 * @param {Array<{ file: string, pattern: RegExp, label: string }>} statements 锚点登记表
 * @returns {Array<{ file: string, content: string, changed: boolean, matched: boolean }>}
 */
export function planVersionStatementSync(entries, version, statements) {
    return entries.map(({ file, content }) => {
        let next = content
        let changed = false
        let matched = false
        for (const statement of statements.filter((item) => item.file === file)) {
            const result = replaceVersionInStatement(next, statement.pattern, version)
            matched = matched || result.matched
            changed = changed || result.changed
            next = result.content
        }
        return { file, content: next, changed, matched }
    })
}

/**
 * 把 `package.json` 的版本行改写为目标版本（保持其余格式与末尾换行）。
 *
 * @param {string} raw package.json 原文
 * @param {string} version 目标版本
 * @returns {{ content: string, changed: boolean }}
 */
export function replacePackageVersion(raw, version) {
    const pattern = /^(\s*"version"\s*:\s*")([^"]*)(")/mu
    const match = pattern.exec(raw)
    if (!match) {
        throw new Error('package.json 未找到 "version" 字段')
    }
    if (match[2] === version) {
        return { content: raw, changed: false }
    }
    const next = `${raw.slice(0, match.index)}${match[1]}${version}${match[3]}${raw.slice(match.index + match[0].length)}`
    return { content: next.endsWith('\n') ? next : `${next}\n`, changed: true }
}

/**
 * 计算文件的 sha1（十六进制），用于与 registry 的 `dist.shasum` 比对。
 *
 * @param {string} filePath 文件路径
 * @returns {string}
 */
export function sha1File(filePath) {
    return createHash('sha1').update(readFileSync(filePath)).digest('hex')
}

/**
 * 读取并校验 tarball 内 `package/package.json` 的 `exports` 键集合。
 *
 * @param {string} unpackDir 解包目录（含 `package/`）
 * @returns {{ name: string, version: string, exports: string[] }}
 */
export function readUnpackedPackage(unpackDir) {
    const pkg = JSON.parse(readFileSync(join(unpackDir, 'package', 'package.json'), 'utf8'))
    return { name: pkg.name, version: pkg.version, exports: Object.keys(pkg.exports ?? {}) }
}

/* ── 执行层 ─────────────────────────────────────────────────────────── */

function spawnOptions(options) {
    return {
        cwd: options.cwd ?? REPO_ROOT,
        shell: process.platform === 'win32',
        ...(options.capture ? { encoding: 'utf8' } : { stdio: 'inherit' }),
    }
}

function run(command, args, options = {}) {
    const result = spawnSync(command, args, spawnOptions(options))
    if (result.status !== 0) {
        throw new Error(`命令失败（exit ${result.status}）：${command} ${args.join(' ')}`)
    }
}

function capture(command, args, options = {}) {
    return spawnSync(command, args, spawnOptions({ ...options, capture: true }))
}

function output(result) {
    return `${result.stdout ?? ''}${result.stderr ?? ''}`.trim()
}

function requireYes(step, ctx) {
    if (ctx.dryRun || ctx.yes) {
        return
    }
    throw new Error(`步骤「${step}」会改动仓库 / 发布，须显式给出 --yes（或用 --dry-run 预览）`)
}

function packageJsonPath(root) {
    return join(root, 'package.json')
}

function readPackageVersion(root) {
    return JSON.parse(readFileSync(packageJsonPath(root), 'utf8')).version
}

function stepPreflight(ctx) {
    const { root } = ctx
    if (output(capture('git', ['status', '--porcelain'], { cwd: root })) !== '') {
        if (ctx.dryRun) {
            process.stdout.write('[preflight] dry-run：工作区不干净（仅提示，真实运行会阻断）\n')
        } else {
            throw new Error('工作区不干净：请先提交或清理后再发布')
        }
    }
    const branch = output(capture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root }))
    if (branch !== RELEASE_BRANCH) {
        throw new Error(`当前分支为 ${branch}，发布须在 ${RELEASE_BRANCH}`)
    }
    const aheadResult = capture('git', ['rev-list', '--count', `origin/${RELEASE_BRANCH}..HEAD`], { cwd: root })
    if (aheadResult.status !== 0) {
        process.stdout.write(`[preflight] 警告：无法比较 origin/${RELEASE_BRANCH}（是否已 fetch？）：${output(aheadResult)}\n`)
    } else if (Number(output(aheadResult)) > 0) {
        process.stdout.write(`[preflight] 提示：本地领先 origin/${RELEASE_BRANCH} ${output(aheadResult)} 个提交（发布前建议先推送）\n`)
    }
    process.stdout.write(`[preflight] 当前 package.json version = ${readPackageVersion(root)}，目标 = ${ctx.version}\n`)
    process.stdout.write('[preflight] 人工确认项：长期任务门槛复核轮已执行并留痕（发布前触发义务）\n')
    if (ctx.dryRun) {
        process.stdout.write('[preflight] dry-run：跳过 pnpm verify / npm 凭据与版本探测\n')
        return
    }
    run('pnpm', ['verify'], { cwd: root })
    const probe = capture('npm', ['view', `${PACKAGE_NAME}@${ctx.version}`, 'version'], { cwd: root })
    const published = output(probe)
    if (probe.status === 0 && published && !/E404|not found|No match/iu.test(published)) {
        throw new Error(`registry 已存在 ${PACKAGE_NAME}@${ctx.version}：版本号须递增`)
    }
    const whoami = capture('npm', ['whoami'], { cwd: root })
    if (whoami.status !== 0) {
        throw new Error(`npm 凭据不可用：${output(whoami)}`)
    }
    process.stdout.write(`[preflight] OK（npm 身份：${output(whoami)}）\n`)
}

function stepBump(ctx) {
    const { root, version, dryRun } = ctx
    const file = packageJsonPath(root)
    const { content, changed } = replacePackageVersion(readFileSync(file, 'utf8'), version)
    if (!changed) {
        process.stdout.write(`[bump] package.json 已是 ${version}，跳过版本写入\n`)
    } else if (dryRun) {
        process.stdout.write(`[bump] dry-run：写入 package.json version = ${version}\n`)
    } else {
        writeFileSync(file, content, 'utf8')
        run('git', ['add', 'package.json'], { cwd: root })
        run('git', ['commit', '-m', `chore(release): ${version}`], { cwd: root })
    }
    if (dryRun) {
        process.stdout.write(`[bump] dry-run：git tag -a v${version} -m "${version}"\n`)
        return
    }
    if (capture('git', ['rev-parse', '-q', '--verify', `refs/tags/v${version}`], { cwd: root }).status === 0) {
        process.stdout.write(`[bump] tag v${version} 已存在，跳过\n`)
        return
    }
    run('git', ['tag', '-a', `v${version}`, '-m', version], { cwd: root })
}

function stepChangelog(ctx) {
    const { root, version, date, dryRun } = ctx
    const args = ['scripts/release/generate-changelog.mjs', `--version=${version}`]
    if (date) {
        args.push(`--date=${date}`)
    }
    if (dryRun) {
        process.stdout.write(`[changelog] dry-run：node ${args.join(' ')} + git commit（仅 CHANGELOG.md）\n`)
        return
    }
    run('node', args, { cwd: root })
    run('git', ['add', 'CHANGELOG.md'], { cwd: root })
    run('git', ['commit', '-m', `docs(changelog): ${version}`], { cwd: root })
}

function stepPublish(ctx) {
    if (ctx.dryRun) {
        process.stdout.write(`[publish] dry-run：npm publish（${PACKAGE_NAME}@${ctx.version}）\n`)
        return
    }
    run('npm', ['publish'], { cwd: ctx.root })
}

function stepVerify(ctx) {
    const { root, version, dryRun } = ctx
    if (dryRun) {
        process.stdout.write('[verify] dry-run：registry 版本 / tarball shasum / 解包 / exports 校验\n')
        return
    }
    const registryVersion = output(capture('npm', ['view', PACKAGE_NAME, 'version'], { cwd: root }))
    if (registryVersion !== version) {
        throw new Error(`registry latest = ${registryVersion}，与目标版本 ${version} 不一致`)
    }
    const expected = output(capture('npm', ['view', `${PACKAGE_NAME}@${version}`, 'dist.shasum'], { cwd: root }))
    const tmp = mkdtempSync(join(tmpdir(), 'caomei-release-'))
    try {
        run('npm', ['pack', `${PACKAGE_NAME}@${version}`, '--pack-destination', tmp], { cwd: root })
        const tarball = join(tmp, `${PACKAGE_NAME}-${version}.tgz`)
        if (!existsSync(tarball)) {
            throw new Error(`未找到 tarball：${tarball}`)
        }
        const actual = sha1File(tarball)
        if (expected && actual !== expected) {
            throw new Error(`tarball shasum 不一致：registry ${expected} / 本地 ${actual}`)
        }
        const unpackDir = join(tmp, 'unpack')
        mkdirSync(unpackDir)
        run('tar', ['-xzf', tarball, '-C', unpackDir])
        const pkg = readUnpackedPackage(unpackDir)
        if (pkg.version !== version) {
            throw new Error(`解包 package.json version = ${pkg.version}，与目标 ${version} 不一致`)
        }
        process.stdout.write(`[verify] OK：registry ${version}、shasum ${actual.slice(0, 12)}…、exports ${pkg.exports.length} 键\n`)
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
}

async function stepSync(ctx) {
    const { root, version, dryRun } = ctx
    const entries = statementFiles(CURRENT_VERSION_STATEMENTS)
        .filter((file) => existsSync(resolve(root, file)))
        .map((file) => ({ file, content: readFileSync(resolve(root, file), 'utf8') }))
    const changedFiles = []
    for (const item of planVersionStatementSync(entries, version, CURRENT_VERSION_STATEMENTS)) {
        if (!item.matched) {
            process.stdout.write(`[sync] 警告：${item.file} 未匹配到版本声明句锚点（句式是否被改写？）\n`)
            continue
        }
        if (!item.changed) {
            process.stdout.write(`[sync] ${item.file} 已同步（无变更）\n`)
            continue
        }
        changedFiles.push(item.file)
        if (dryRun) {
            process.stdout.write(`[sync] dry-run：更新 ${item.file} 的当前版本句 → ${version}\n`)
        } else {
            writeFileSync(resolve(root, item.file), item.content, 'utf8')
            process.stdout.write(`[sync] 已更新 ${item.file}\n`)
        }
    }
    if (dryRun) {
        process.stdout.write('[sync] dry-run：pnpm docs:check:version（守卫前置）\n')
        process.stdout.write(`[sync] dry-run：git add ${changedFiles.join(' ')} + git commit（docs(release): sync version statements to ${version}）\n`)
        return
    }
    // 守卫前置：版本句未同步到位则不落提交（避免提交坏状态）
    run('pnpm', ['docs:check:version'], { cwd: root })
    if (changedFiles.length > 0) {
        run('git', ['add', ...changedFiles], { cwd: root })
        run('git', ['commit', '-m', `docs(release): sync version statements to ${version}`], { cwd: root })
    } else {
        process.stdout.write('[sync] 无版本句变更，跳过提交\n')
    }
    if (output(capture('git', ['status', '--porcelain'], { cwd: root })) !== '') {
        process.stdout.write('[sync] 警告：工作区仍有未提交改动，推送前请先处理\n')
    }
}

function stepAnnounce(ctx) {
    const { root, version, dryRun } = ctx
    const notes = extractChangelogSection(readFileSync(join(root, 'CHANGELOG.md'), 'utf8'), version)
    if (!notes) {
        if (dryRun) {
            process.stdout.write(`[announce] dry-run：CHANGELOG 尚无 v${version} 段落（真实运行时由 changelog 步骤生成）\n`)
            return
        }
        throw new Error(`CHANGELOG.md 未找到 v${version} 段落，无法生成 GitHub Release note`)
    }
    if (dryRun) {
        process.stdout.write(`[announce] dry-run：gh release create v${version} --verify-tag（note ${notes.split('\n').length} 行）\n`)
        return
    }
    const tmp = mkdtempSync(join(tmpdir(), 'caomei-notes-'))
    try {
        const notesFile = join(tmp, 'notes.md')
        writeFileSync(notesFile, `${notes}\n`, 'utf8')
        run('gh', ['release', 'create', `v${version}`, '--title', version, '--verify-tag', '--notes-file', notesFile], { cwd: root })
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
    process.stdout.write(`[announce] OK。推送由用户执行：git push origin ${RELEASE_BRANCH} --follow-tags\n`)
}

const STEP_RUNNERS = {
    preflight: stepPreflight,
    bump: stepBump,
    changelog: stepChangelog,
    publish: stepPublish,
    verify: stepVerify,
    sync: stepSync,
    announce: stepAnnounce,
}

async function runStep(step, ctx) {
    process.stdout.write(`\n── ${step} ──\n`)
    if (MUTATING_STEPS.has(step)) {
        requireYes(step, ctx)
    }
    await STEP_RUNNERS[step](ctx)
}

async function main() {
    const options = parseArgs(process.argv.slice(2))
    if (options.error) {
        process.stderr.write(`[manual-release] ${options.error}\n${USAGE}\n`)
        process.exitCode = 1
        return
    }
    validateVersion(options.version)
    validateDate(options.date)
    const ctx = { root: REPO_ROOT, version: options.version, date: options.date, yes: options.yes, dryRun: options.dryRun }
    if (options.step === 'run') {
        for (const step of STEPS) {
            await runStep(step, ctx)
        }
        process.stdout.write('\n[manual-release] 全流程完成；git push 由用户执行\n')
        return
    }
    await runStep(options.step, ctx)
}

if (isDirectExecution(import.meta.url)) {
    await main()
}
