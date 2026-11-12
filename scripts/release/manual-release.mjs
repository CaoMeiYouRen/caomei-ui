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
 *   node scripts/release/manual-release.mjs run --version=1.0.0-rc.1 --tag=next [--date=YYYY-MM-DD] [--yes] [--dry-run]
 *   pnpm release:manual <step> --version=<v> [--tag=next|latest] [--base=<version>] [--allow-breaking=<记录路径>]
 * steps：见 STEPS（preflight | api-diff | bump | changelog | sync | publish | verify | announce）| run
 *
 * 变更型步骤（bump / changelog / publish / sync / announce）**必须显式给出 `--yes`**
 * （或以 `--dry-run` 预览），避免误触发不可逆动作。
 *
 * dist-tag 不变量：预发布版本（含 `-` 后缀）默认发 `next` 且**禁止**发 `latest`；
 * 正式版默认发 `latest`。`preflight` 另生成覆盖率证据（`test:coverage` + `check:coverage`）。
 *
 * 发布前安全门禁（强制）：`preflight` 与 `publish` 都会执行
 * [安全规范 §2.1](../../docs/standards/security.md) 的告警门禁；`SECURITY_ALERTS_TOKEN`
 * 缺失即中止（fail-closed）。本地把该变量写入仓库根的 `.env.local`（已 gitignore）即可，
 * 真实环境变量优先。
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { isDirectExecution } from '../shared/cli.mjs'
import { LOCAL_ENV_FILE, loadLocalEnv } from '../shared/env.mjs'
import { CURRENT_VERSION_STATEMENTS, planVersionStatementSync, replaceVersionInStatement, statementFiles } from '../shared/version-statements.mjs'
import { DEFAULT_EXEMPTIONS_PATH, assertSecurityGate } from './check-security-alerts.mjs'
import { stepApiDiff } from './api-diff-step.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
export const PACKAGE_NAME = 'caomei-ui'
export const RELEASE_BRANCH = 'master'

/** 允许的 npm dist-tag：预发布 → `next`，正式版 → `latest`。 */
export const DIST_TAGS = ['next', 'latest']
/** 预发布版本默认 dist-tag。 */
export const DEFAULT_PRERELEASE_TAG = 'next'
/** 正式版默认 dist-tag。 */
export const DEFAULT_STABLE_TAG = 'latest'

/**
 * 全流程步骤（顺序即执行顺序）。
 *
 * `sync` 必须排在 `publish` **之前**：`npm publish` 打包的是当前工作区，README 随包发布。
 * 若 `sync` 在后，tarball 内的「当前版本」句会永远落后一版（`1.0.0-rc.1` 实测：README 仍写 `0.7.0`）。
 */
export const STEPS = ['preflight', 'api-diff', 'bump', 'changelog', 'sync', 'publish', 'verify', 'announce']

/** 改动仓库状态的步骤：须显式 `--yes` 或 `--dry-run`。 */
export const MUTATING_STEPS = new Set(['bump', 'changelog', 'publish', 'sync', 'announce'])

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u

const USAGE = `用法：node scripts/release/manual-release.mjs <step> --version=<v> [--tag=next|latest] [--date=YYYY-MM-DD] [--otp=<code>] [--base=<version>] [--allow-breaking=<path>] [--yes] [--dry-run]
steps：${STEPS.join(' | ')} | run
  --version  目标版本（semver，如 1.0.0-rc.1 / 1.0.0）
  --tag      npm dist-tag（next | latest）；缺省按版本推断：预发布 → next，正式版 → latest
  --date     可选，固定 CHANGELOG 发布日期（YYYY-MM-DD）
  --otp      可选，npm 一次性密码（6-8 位数字；仅 publish 使用；未提供时由 npm 交互提示）
  --base     可选，API 差分基线版本；缺省按目标 dist-tag 取同通道上一已发布版本
  --allow-breaking 可选，已批准的治理记录路径；仅用于显式放行 breaking（会打印留痕）
  --yes      确认执行变更型步骤（非交互环境必须显式给出）
  --dry-run  只打印计划动作，不落盘 / 不改 git / 不发布`

/**
 * 解析命令行参数。
 *
 * @param {string[]} argv 参数列表（不含 node / 脚本名）
 * @returns {{ step: string, version: string | undefined, tag: string | undefined, date: string | undefined, otp: string | undefined, base: string | undefined, allowBreaking: string | undefined, yes: boolean, dryRun: boolean, error: string | null }}
 */
export function parseArgs(argv) {
    let step = null
    let version
    let tag
    let date
    let otp
    let base
    let allowBreaking
    let yes = false
    let dryRun = false
    const unknown = (error) => ({ step: '', version, tag, date, otp, base, allowBreaking, yes, dryRun, error })
    for (const arg of argv) {
        if (arg === '--yes') {
            yes = true
        } else if (arg === '--dry-run') {
            dryRun = true
        } else if (arg.startsWith('--version=')) {
            version = arg.slice('--version='.length)
        } else if (arg.startsWith('--tag=')) {
            tag = arg.slice('--tag='.length)
        } else if (arg.startsWith('--date=')) {
            date = arg.slice('--date='.length)
        } else if (arg.startsWith('--otp=')) {
            otp = arg.slice('--otp='.length)
        } else if (arg.startsWith('--base=')) {
            base = arg.slice('--base='.length)
        } else if (arg.startsWith('--allow-breaking=')) {
            allowBreaking = arg.slice('--allow-breaking='.length)
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
    if (base !== undefined && base.trim() === '') {
        return unknown('--base 不能为空')
    }
    if (allowBreaking !== undefined && allowBreaking.trim() === '') {
        return unknown('--allow-breaking 不能为空')
    }
    return { step, version, tag, date, otp, base, allowBreaking, yes, dryRun, error: null }
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
 * 判断版本是否为预发布（semver 预发布后缀，如 `1.0.0-rc.1`）。
 *
 * @param {string} version
 * @returns {boolean}
 */
export function isPrereleaseVersion(version) {
    return version.includes('-')
}

/**
 * 解析并校验目标 npm dist-tag。
 *
 * 安全不变量：预发布版本**不得**发布到 `latest`（否则 rc 会覆盖正式版通道）。
 * 未显式给出 `--tag` 时按版本推断：预发布 → `next`，正式版 → `latest`。
 *
 * @param {string} version 目标版本（已通过 validateVersion）
 * @param {string | undefined} tag 显式 dist-tag
 * @returns {string}
 */
export function resolveDistTag(version, tag) {
    if (tag !== undefined && !DIST_TAGS.includes(tag)) {
        throw new Error(`Invalid --tag: ${tag}（可用：${DIST_TAGS.join(' | ')}）`)
    }
    const prerelease = isPrereleaseVersion(version)
    const resolved = tag ?? (prerelease ? DEFAULT_PRERELEASE_TAG : DEFAULT_STABLE_TAG)
    if (prerelease && resolved === 'latest') {
        throw new Error(`预发布版本 ${version} 不得发布到 latest（请改用 --tag=next）`)
    }
    return resolved
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
 * 校验 npm 一次性密码（OTP）。
 *
 * npm 通常为 6 位数字，兼容 6-8 位；未提供时返回 undefined，由 npm 在 publish 时交互提示。
 *
 * @param {string | undefined} otp
 * @returns {string | undefined}
 */
export function validateOtp(otp) {
    if (otp === undefined) {
        return undefined
    }
    if (!/^\d{6,8}$/u.test(otp)) {
        // 不回显输入值：OTP 属一次性凭据，错误日志也不应留下接近完整的验证码。
        throw new Error('Invalid --otp（期望 6-8 位数字）')
    }
    return otp
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
    // 版本边界用「合法后继」白名单（行尾 / 空白 / 括号），而不是黑名单：黑名单会漏掉
    // 字母续接的预发布段（1.0.0-beta 曾静默命中 1.0.0-betamax），导致 Release note 取错段落。
    const heading = new RegExp(`^#\\s+\\[?${escaped}\\]?(?=$|\\s|\\()`, 'u')
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
 * 保持既有导入面：版本句替换 / 同步函数已下沉到 `scripts/shared/version-statements.mjs`，
 * 发布流脚本与测试仍从本模块导入。
 */
export { planVersionStatementSync, replaceVersionInStatement }


/**
 * 决定 `sync` 的提交动作：有改写则提交；已是目标版本但文件仍脏则 fail-closed；否则跳过。
 *
 * @param {{ changedFiles: string[], dirtyFiles?: string[] }} input 改写的文件与未提交的受检文件
 * @returns {{ action: 'commit'|'error'|'skip', files: string[] }} 动作与涉及文件
 */
export function decideSyncCommit({ changedFiles, dirtyFiles = [] }) {
    if (changedFiles.length > 0) {
        return { action: 'commit', files: changedFiles }
    }
    if (dirtyFiles.length > 0) {
        return { action: 'error', files: dirtyFiles }
    }
    return { action: 'skip', files: [] }
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

/**
 * 解析 `npm view <pkg> dist-tags --json` 输出。
 *
 * @param {string} text 命令输出（JSON 对象）
 * @returns {Record<string, string>} dist-tag → version；非法输入返回空对象
 */
export function parseDistTags(text) {
    try {
        const parsed = JSON.parse(text)
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            return {}
        }
        return parsed
    } catch {
        return {}
    }
}

/**
 * 校验目标 dist-tag 指向目标版本，并守住「预发布不进 latest」。
 *
 * `latest` 上出现**任何**预发布版本（含历史 rc）都判失败——该通道只应指向正式版。
 *
 * @param {{ version: string, tag: string, distTags: Record<string, string> }} state
 * @returns {{ ok: boolean, error: string | null }}
 */
export function checkDistTagState({ version, tag, distTags }) {
    const actual = typeof distTags?.[tag] === 'string' ? distTags[tag] : null
    if (actual !== version) {
        return {
            ok: false,
            error: `dist-tag ${tag} = ${actual ?? '（缺失）'}，与目标版本 ${version} 不一致`,
        }
    }
    const latest = typeof distTags?.latest === 'string' ? distTags.latest : null
    if (latest && isPrereleaseVersion(latest)) {
        return {
            ok: false,
            error: `预发布版本 ${latest} 出现在 latest dist-tag 上（预发布只能发 next）`,
        }
    }
    return { ok: true, error: null }
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
        // 允许调用方提供脱敏后的展示参数（如 --otp=***），避免错误日志泄露 OTP。
        const displayArgs = options.displayArgs ?? args
        throw new Error(`命令失败（exit ${result.status}）：${command} ${displayArgs.join(' ')}`)
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

/**
 * 安全告警门禁参数：token 只从 `ctx.env` 读取（`main` 启动时已合并 `.env.local`），
 * 不写入 `process.env`，避免被 `pnpm verify` / `npm publish` 等子进程继承。
 *
 * @param {{ root: string, env?: NodeJS.ProcessEnv }} ctx 运行上下文
 * @returns {{ root: string, token: string | undefined, exemptionsPath: string, env: NodeJS.ProcessEnv | undefined }} 门禁参数
 */
function securityGateOptions(ctx) {
    return {
        root: ctx.root,
        token: (ctx.env ?? process.env).SECURITY_ALERTS_TOKEN,
        exemptionsPath: join(ctx.root, DEFAULT_EXEMPTIONS_PATH),
        env: ctx.env,
    }
}

/**
 * 执行发布前安全告警门禁；阻塞项或 token 缺失即抛错（fail-closed）。
 *
 * `ctx.securityGate` 仅供测试注入：默认使用真实门禁实现。
 *
 * @param {{ root: string, env?: NodeJS.ProcessEnv, securityGate?: typeof assertSecurityGate }} ctx 运行上下文
 * @param {string} label 输出前缀
 * @returns {Promise<void>}
 */
async function runSecurityGate(ctx, label) {
    const gate = ctx.securityGate ?? assertSecurityGate
    process.stdout.write(`[${label}] 发布前安全告警门禁：检查 Dependabot / Code Scanning 的 open 告警\n`)
    await gate(securityGateOptions(ctx))
}

/**
 * 判断发布分支守卫的处置方式。
 *
 * 真实运行必须在 `RELEASE_BRANCH` 上，否则阻断；`--dry-run` 不落盘、不改 git、不发布，
 * 故与「工作区不干净」同口径降级为提示——任意分支（含 PR 检出的 detached HEAD）都能预览计划，
 * 避免 dry-run 只是为了看计划就被前置条件拦死。
 *
 * @param {string} branch 当前分支名（detached HEAD 时为 `HEAD`）
 * @param {boolean} dryRun 是否为 dry-run 预览
 * @returns {{ blocked: boolean, notice: string | null }} 是否阻断、需要打印的提示
 */
export function evaluateReleaseBranch(branch, dryRun) {
    if (branch === RELEASE_BRANCH) {
        return { blocked: false, notice: null }
    }
    if (dryRun) {
        return {
            blocked: false,
            notice: `[preflight] dry-run：当前分支为 ${branch}（仅提示，真实运行会阻断：须在 ${RELEASE_BRANCH}）\n`,
        }
    }
    return { blocked: true, notice: null }
}

async function stepPreflight(ctx) {
    const { root } = ctx
    if (output(capture('git', ['status', '--porcelain'], { cwd: root })) !== '') {
        if (ctx.dryRun) {
            process.stdout.write('[preflight] dry-run：工作区不干净（仅提示，真实运行会阻断）\n')
        } else {
            throw new Error('工作区不干净：请先提交或清理后再发布')
        }
    }
    const branch = output(capture('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root }))
    const branchGuard = evaluateReleaseBranch(branch, ctx.dryRun)
    if (branchGuard.notice) {
        process.stdout.write(branchGuard.notice)
    }
    if (branchGuard.blocked) {
        throw new Error(`当前分支为 ${branch}，发布须在 ${RELEASE_BRANCH}`)
    }
    const aheadResult = capture('git', ['rev-list', '--count', `origin/${RELEASE_BRANCH}..HEAD`], { cwd: root })
    if (aheadResult.status !== 0) {
        process.stdout.write(`[preflight] 警告：无法比较 origin/${RELEASE_BRANCH}（是否已 fetch？）：${output(aheadResult)}\n`)
    } else if (Number(output(aheadResult)) > 0) {
        process.stdout.write(`[preflight] 提示：本地领先 origin/${RELEASE_BRANCH} ${output(aheadResult)} 个提交（发布前建议先推送）\n`)
    }
    process.stdout.write(`[preflight] 当前 package.json version = ${readPackageVersion(root)}，目标 = ${ctx.version}（dist-tag = ${ctx.tag}）\n`)
    process.stdout.write('[preflight] 人工确认项：长期任务门槛复核轮已执行并留痕（发布前触发义务）\n')
    if (ctx.dryRun) {
        process.stdout.write('[preflight] dry-run：跳过安全告警门禁 / pnpm verify / test:coverage / check:coverage / npm 凭据与版本探测\n')
        return
    }
    // 安全门禁放在 verify 之前：被 critical / high 阻塞时不必再等全量质量门。
    await runSecurityGate(ctx, 'preflight')
    run('pnpm', ['verify'], { cwd: root })
    // 覆盖率证据：verify 不含覆盖率校验，故在预检内单独生成并断言（发布前置）。
    run('pnpm', ['test:coverage'], { cwd: root })
    run('pnpm', ['check:coverage'], { cwd: root })
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

/**
 * 校验 npm `dist.shasum` 形态（40 位小写十六进制 sha1）。
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isValidShasum(value) {
    return typeof value === 'string' && /^[0-9a-f]{40}$/u.test(value)
}

/**
 * 构造 `npm publish` 参数；必须显式带目标 dist-tag，提供 OTP 时追加 `--otp=<code>`。
 *
 * @param {string | undefined} otp
 * @param {string} tag 目标 dist-tag（next / latest）
 * @returns {string[]}
 */
export function buildPublishArgs(otp, tag) {
    if (!tag) {
        throw new Error('缺少目标 dist-tag（next | latest）')
    }
    const args = ['publish', `--tag=${tag}`]
    if (otp) {
        args.push(`--otp=${otp}`)
    }
    return args
}

/**
 * 断言「当前版本」声明句已同步到目标版本。
 *
 * `npm publish` 打包当前工作区，README 随包发布；版本句未同步会让 tarball 内的版本声明
 * 永远落后一版（`1.0.0-rc.1` 实测 README 仍写 `0.7.0`）。分步执行可绕过 `STEPS` 顺序，
 * 故在 `publish` 前 fail-closed。
 *
 * @param {Record<string, string>} contentByFile 文件路径 → 内容
 * @param {string} version 目标版本
 * @param {Array<{ file: string, pattern: RegExp, label: string }>} statements 声明句登记表
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function assertVersionStatements(contentByFile, version, statements = CURRENT_VERSION_STATEMENTS) {
    const problems = []
    for (const entry of statements) {
        const content = contentByFile[entry.file]
        if (content === undefined) {
            problems.push(`${entry.file}：文件缺失`)
            continue
        }
        const match = entry.pattern.exec(content)
        if (!match) {
            problems.push(`${entry.file}：未匹配${entry.label}锚点（句式被改写？）`)
            continue
        }
        if (match[1] !== version) {
            problems.push(`${entry.file}：${entry.label} = ${match[1]}，期望 ${version}`)
        }
    }
    return problems
}

/**
 * 发布前置断言：`package.json` 版本 + 全部「当前版本」声明句都必须是目标版本。
 *
 * 不预过滤缺文件——改名 / 删除声明句载体同样必须 fail-closed（否则守卫视同通过）。
 *
 * @param {string} root 仓库根
 * @param {string} version 目标版本
 */
export function assertPublishVersionStatements(root, version) {
    const problems = []
    const actualVersion = readPackageVersion(root)
    if (actualVersion !== version) {
        problems.push(`package.json：version = ${actualVersion}，期望 ${version}（是否漏跑 bump？）`)
    }
    const contentByFile = {}
    for (const file of statementFiles(CURRENT_VERSION_STATEMENTS)) {
        try {
            contentByFile[file] = readFileSync(resolve(root, file), 'utf8')
        } catch {
            // 缺文件交由 assertVersionStatements 记为 problem（fail-closed）。
        }
    }
    problems.push(...assertVersionStatements(contentByFile, version))
    return problems
}

/**
 * 发布步骤：版本就绪断言 → 安全门禁复跑 → `npm publish`。
 *
 * `ctx.publish` 仅供测试注入（默认真实执行 `npm publish`），用于证明门禁失败时不会走到发布动作。
 *
 * @param {{ root: string, version: string, tag: string, otp?: string, dryRun: boolean, env?: NodeJS.ProcessEnv, securityGate?: typeof assertSecurityGate, assertVersionStatements?: (root: string, version: string) => string[], publish?: (args: string[], options: { cwd: string, displayArgs: string[] }) => void | Promise<void> }} ctx 运行上下文
 * @returns {Promise<void>}
 */
export async function stepPublish(ctx) {
    if (!DIST_TAGS.includes(ctx.tag)) {
        throw new Error(`缺少目标 dist-tag（next | latest）：${ctx.tag ?? '（空）'}`)
    }
    const args = buildPublishArgs(ctx.otp, ctx.tag)
    const displayArgs = buildPublishArgs(ctx.otp ? '***' : undefined, ctx.tag)
    if (ctx.dryRun) {
        process.stdout.write('[publish] dry-run：真实运行会先校验 package.json 版本与「当前版本」声明句，并复跑安全告警门禁，未通过即中止\n')
        process.stdout.write(`[publish] dry-run：npm ${displayArgs.join(' ')}（${PACKAGE_NAME}@${ctx.version} → dist-tag ${ctx.tag}）\n`)
        return
    }
    const checkVersionStatements = ctx.assertVersionStatements ?? assertPublishVersionStatements
    const prePublishProblems = checkVersionStatements(ctx.root, ctx.version)
    if (prePublishProblems.length > 0) {
        throw new Error(
            `版本未就绪，拒绝发布（tarball 内 README 会落后一版）：\n${prePublishProblems.join('\n')}\n`
            + '请先执行 bump / sync（见 docs/guide/release.md §3.3 第 3 / 5 步）',
        )
    }
    // 门禁在不可逆动作前复跑：preflight 与 publish 之间可能隔了 verify / coverage 的长时间窗口。
    await runSecurityGate(ctx, 'publish')
    process.stdout.write(`[publish] 发布 ${PACKAGE_NAME}@${ctx.version} → dist-tag ${ctx.tag}\n`)
    const publish = ctx.publish ?? ((publishArgs, options) => run('npm', publishArgs, options))
    await publish(args, { cwd: ctx.root, displayArgs })
}

function stepVerify(ctx) {
    const { root, version, tag, dryRun } = ctx
    if (dryRun) {
        process.stdout.write(`[verify] dry-run：registry dist-tags.${tag} / tarball shasum / 解包 / exports 校验\n`)
        return
    }
    const distTagsResult = capture('npm', ['view', PACKAGE_NAME, 'dist-tags', '--json'], { cwd: root })
    if (distTagsResult.status !== 0) {
        throw new Error(`无法读取 registry dist-tags：${output(distTagsResult)}`)
    }
    const distTags = parseDistTags(distTagsResult.stdout ?? '')
    const distTagState = checkDistTagState({ version, tag, distTags })
    if (!distTagState.ok) {
        throw new Error(distTagState.error)
    }
    const shasumResult = capture('npm', ['view', `${PACKAGE_NAME}@${version}`, 'dist.shasum'], { cwd: root })
    if (shasumResult.status !== 0) {
        throw new Error(`无法读取 registry dist.shasum：${output(shasumResult)}`)
    }
    const expected = (shasumResult.stdout ?? '').trim()
    if (!isValidShasum(expected)) {
        throw new Error(`registry dist.shasum 形态非法：${expected || '（空）'}`)
    }
    const tmp = mkdtempSync(join(tmpdir(), 'caomei-release-'))
    try {
        run('npm', ['pack', `${PACKAGE_NAME}@${version}`, '--pack-destination', tmp], { cwd: root })
        const tarball = join(tmp, `${PACKAGE_NAME}-${version}.tgz`)
        if (!existsSync(tarball)) {
            throw new Error(`未找到 tarball：${tarball}`)
        }
        const actual = sha1File(tarball)
        if (actual !== expected) {
            throw new Error(`tarball shasum 不一致：registry ${expected} / 本地 ${actual}`)
        }
        const unpackDir = join(tmp, 'unpack')
        mkdirSync(unpackDir)
        run('tar', ['-xzf', tarball, '-C', unpackDir])
        const pkg = readUnpackedPackage(unpackDir)
        if (pkg.version !== version) {
            throw new Error(`解包 package.json version = ${pkg.version}，与目标 ${version} 不一致`)
        }
        // 产物级断言：tarball 内 README 的「当前版本」句必须已是目标版本（发布链顺序的最终防线）。
        const packaged = {}
        for (const file of ['README.md', 'README.en-US.md']) {
            const packagedPath = join(unpackDir, 'package', file)
            if (existsSync(packagedPath)) {
                packaged[file] = readFileSync(packagedPath, 'utf8')
            }
        }
        if (packaged['README.md'] === undefined) {
            throw new Error('tarball 内缺少 README.md（npm 必带），无法校验版本句')
        }
        // roadmap 不随包发布，只排除它；README 中英都随包，缺失即 fail-closed。
        const packagedStatements = CURRENT_VERSION_STATEMENTS.filter((entry) => entry.file !== 'docs/plan/roadmap.md')
        const readmeProblems = assertVersionStatements(packaged, version, packagedStatements)
        if (readmeProblems.length > 0) {
            throw new Error(`tarball 内 README 版本句不一致：\n${readmeProblems.join('\n')}`)
        }
        process.stdout.write(`[verify] OK：dist-tag ${tag} = ${version}、shasum ${actual.slice(0, 12)}…、exports ${pkg.exports.length} 键\n`)
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
    const statementPaths = entries.map((entry) => entry.file)
    // 上次 sync 已写入文件但守卫 / 提交失败时，重跑会看到 changed=false；此时若仍有未提交改动，
    // 必须 fail-closed，避免带着半提交状态继续 announce。
    let dirtyFiles = []
    if (statementPaths.length > 0) {
        const statusResult = capture('git', ['status', '--porcelain', '--', ...statementPaths], { cwd: root })
        if (statusResult.status !== 0) {
            throw new Error(`git status 失败：${output(statusResult)}`)
        }
        dirtyFiles = (statusResult.stdout ?? '')
            .split(/\r?\n/u)
            .filter(Boolean)
            .map((line) => line.slice(3).trim())
    }
    const decision = decideSyncCommit({ changedFiles, dirtyFiles })
    if (decision.action === 'commit') {
        run('git', ['add', ...decision.files], { cwd: root })
        run('git', ['commit', '-m', `docs(release): sync version statements to ${version}`], { cwd: root })
    } else if (decision.action === 'error') {
        throw new Error(`版本句已是 ${version}，但以下文件仍有未提交改动：\n${decision.files.join('\n')}\n请先提交后再执行 sync / announce`)
    } else {
        process.stdout.write('[sync] 无版本句变更，跳过提交\n')
    }
    if (output(capture('git', ['status', '--porcelain'], { cwd: root })) !== '') {
        process.stdout.write('[sync] 警告：工作区仍有未提交改动，推送前请先处理\n')
    }
}

/**
 * 解析 `git ls-remote --tags` 输出中的 tag 对象 SHA。
 *
 * annotated tag 会同时输出 tag 对象行与 peeled `^{}` 行；这里取 tag 对象行，
 * 与本地 `git rev-parse refs/tags/<tag>` 的返回值同源。
 *
 * @param {string} outputText
 * @returns {string | null}
 */
export function parseRemoteTagSha(outputText) {
    const line = outputText
        .split(/\r?\n/u)
        .map((item) => item.trim())
        .find((item) => item !== '' && !item.includes('^{}'))
    return line ? line.split(/\s+/u)[0] ?? null : null
}

/** 本地 tag 已存在、远程缺失时的可操作提示。 */
export function formatLocalTagNotPushed(version, localSha) {
    return `本地已有 tag v${version}（${localSha.slice(0, 12)}…），但远程尚无该 tag；`
        + `请先执行 git push origin v${version}（或 git push origin ${RELEASE_BRANCH} --follow-tags）后重试 announce。`
}

/**
 * 根据本地 / 远程 tag SHA 判定 announce 的下一步。
 *
 * @param {{ version: string, localSha: string | null, remoteSha: string | null }} state
 * @returns {{ ok: boolean, error: string | null }}
 */
export function resolveTagState({ version, localSha, remoteSha }) {
    if (!localSha && !remoteSha) {
        return { ok: false, error: `tag v${version} 不存在；请先运行 bump 步骤创建 tag。` }
    }
    if (!localSha && remoteSha) {
        return { ok: false, error: `远程已有 tag v${version}，但本地没有；请先执行 git fetch --tags 后重试 announce。` }
    }
    if (localSha && !remoteSha) {
        return { ok: false, error: formatLocalTagNotPushed(version, localSha) }
    }
    if (localSha !== remoteSha) {
        return {
            ok: false,
            error: `本地 tag v${version}（${localSha.slice(0, 12)}…）与远程（${remoteSha.slice(0, 12)}…）不一致；`
                + '请先核对 / 同步 tag 后再发布（不要直接覆盖已发布 tag）。',
        }
    }
    return { ok: true, error: null }
}

/**
 * 构造 `gh release create` 参数：
 * - 预发布版本标记 `--prerelease`，避免 rc 被 GitHub 视为 Latest Release；
 * - 目标 dist-tag 不是 `latest` 时标记 `--latest=false`，避免 staged release 抢 Latest。
 *
 * @param {string} version
 * @param {string} tag 目标 dist-tag（next / latest）
 * @param {string | undefined} notesFile
 * @returns {string[]}
 */
export function buildAnnounceArgs(version, tag, notesFile) {
    if (!tag) {
        throw new Error('缺少目标 dist-tag（next | latest）')
    }
    const args = ['release', 'create', `v${version}`, '--title', version, '--verify-tag']
    if (isPrereleaseVersion(version)) {
        args.push('--prerelease')
    }
    if (tag !== 'latest') {
        args.push('--latest=false')
    }
    if (notesFile) {
        args.push('--notes-file', notesFile)
    }
    return args
}

function stepAnnounce(ctx) {
    const { root, version, tag, dryRun } = ctx
    const notes = extractChangelogSection(readFileSync(join(root, 'CHANGELOG.md'), 'utf8'), version)
    if (!notes) {
        if (dryRun) {
            const preview = buildAnnounceArgs(version, tag).join(' ')
            process.stdout.write(`[announce] dry-run：CHANGELOG 尚无 v${version} 段落（真实运行时由 changelog 步骤生成）；计划 gh ${preview}\n`)
            return
        }
        throw new Error(`CHANGELOG.md 未找到 v${version} 段落，无法生成 GitHub Release note`)
    }
    if (dryRun) {
        const preview = buildAnnounceArgs(version, tag).join(' ')
        process.stdout.write(`[announce] dry-run：校验本地 / 远程 tag v${version} → gh ${preview}（note ${notes.split('\n').length} 行）\n`)
        return
    }

    const localResult = capture('git', ['rev-parse', '-q', '--verify', `refs/tags/v${version}`], { cwd: root })
    const localSha = localResult.status === 0 ? output(localResult) : null
    const remoteResult = capture('git', ['ls-remote', '--tags', 'origin', `refs/tags/v${version}`], { cwd: root })
    if (remoteResult.status !== 0) {
        throw new Error(`无法查询远程 tag v${version}：${output(remoteResult) || 'git ls-remote 失败'}（是否已配置 origin？）`)
    }
    const remoteSha = parseRemoteTagSha(output(remoteResult))
    const tagState = resolveTagState({ version, localSha, remoteSha })
    if (!tagState.ok) {
        throw new Error(tagState.error)
    }

    const tmp = mkdtempSync(join(tmpdir(), 'caomei-notes-'))
    try {
        const notesFile = join(tmp, 'notes.md')
        writeFileSync(notesFile, `${notes}\n`, 'utf8')
        run('gh', buildAnnounceArgs(version, tag, notesFile), { cwd: root })
    } finally {
        rmSync(tmp, { recursive: true, force: true })
    }
    process.stdout.write(`[announce] OK。若 ${RELEASE_BRANCH} 尚未推送，请执行：git push origin ${RELEASE_BRANCH}\n`)
}

const STEP_RUNNERS = {
    preflight: stepPreflight,
    'api-diff': stepApiDiff,
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
    // 本地发布凭据：真实环境变量优先，`.env.local` 只补缺失项（已 gitignore）。
    // 合并进 `ctx.env` 而非 `process.env`：PAT 不随子进程（verify / npm / gh）继承。
    // `CAOMEI_SKIP_LOCAL_ENV=1` 是测试旁路，避免开发者本机文件影响 CLI 用例。
    const env = { ...process.env }
    if (process.env.CAOMEI_SKIP_LOCAL_ENV !== '1') {
        try {
            const loaded = loadLocalEnv(REPO_ROOT, { env })
            if (loaded.length > 0) {
                process.stdout.write(`[env] 已从 ${LOCAL_ENV_FILE} 载入：${loaded.join(', ')}\n`)
            }
        } catch (error) {
            process.stderr.write(`[manual-release] ${error.message}\n`)
            process.exitCode = 1
            return
        }
    } else {
        process.stdout.write('[env] CAOMEI_SKIP_LOCAL_ENV=1：已跳过 .env.local\n')
    }
    const options = parseArgs(process.argv.slice(2))
    if (options.error) {
        process.stderr.write(`[manual-release] ${options.error}\n${USAGE}\n`)
        process.exitCode = 1
        return
    }
    let tag
    try {
        validateVersion(options.version)
        validateDate(options.date)
        validateOtp(options.otp)
        tag = resolveDistTag(options.version, options.tag)
    } catch (error) {
        process.stderr.write(`[manual-release] ${error.message}\n`)
        process.exitCode = 1
        return
    }
    const ctx = {
        root: REPO_ROOT,
        version: options.version,
        tag,
        date: options.date,
        otp: options.otp,
        base: options.base,
        allowBreaking: options.allowBreaking,
        fromRun: options.step === 'run',
        yes: options.yes,
        dryRun: options.dryRun,
        env,
    }
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
    try {
        await main()
    } catch (error) {
        // 步骤失败统一走「[manual-release] 消息 + exit 1」，不输出未处理拒绝栈。
        process.stderr.write(`[manual-release] ${error.message}\n`)
        process.exitCode = 1
    }
}
