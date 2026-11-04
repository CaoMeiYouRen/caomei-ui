#!/usr/bin/env node

/**
 * generate-changelog：基于 conventional-changelog 与 conventional-changelog-cmyr-config
 * 预设生成 / 重写 CHANGELOG.md。
 *
 * 用途：本地手动发布（首发停在 0.x）时生成发布说明，生成口径与 semantic-release 一致。
 * 说明：semantic-release 首版恒为 1.0.0、无法停在 0.x，故 0.x 首版由手工建立；
 * 本脚本允许用 `--version=` / `--date=` 在没有基线 tag 时生成首版条目。
 *
 * 须在仓库根运行：预设依据 `process.cwd()` 下的 package.json 决定分组语言。
 *
 * 用法：
 *   node scripts/release/generate-changelog.mjs [--version=0.1.0] [--date=2026-09-19]
 *   pnpm changelog
 */
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ConventionalChangelog } from 'conventional-changelog'
import createPreset from 'conventional-changelog-cmyr-config'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const CHANGELOG_PATH = join(REPO_ROOT, 'CHANGELOG.md')

const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/u

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        values: {
            '--version': { key: 'version' },
            '--date': { key: 'date' },
        },
    })
}

export function validateOptions({ version, date } = {}) {
    if (version !== undefined && !VERSION_PATTERN.test(version)) {
        throw new Error(`Invalid --version: ${version}（期望 semver，如 0.1.0）`)
    }
    if (date !== undefined && !DATE_PATTERN.test(date)) {
        throw new Error(`Invalid --date: ${date}（期望 YYYY-MM-DD）`)
    }
}

export async function readPackageField(field, root = REPO_ROOT) {
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
    return pkg[field]
}

/**
 * 读取仓库的 origin remote；缺失时返回空串。
 *
 * 不能只靠 `readRepository()` 的 try/catch：它在 v7 里把 promise 组合进参数、返回 `this`，
 * 真正的 git 失败发生在后续 `write()` 中，无法在调用点捕获。
 *
 * @param {string} root 仓库根
 * @returns {string}
 */
export function readOriginRemote(root) {
    try {
        return execFileSync('git', ['-C', root, 'config', '--get', 'remote.origin.url'], {
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim()
    } catch {
        return ''
    }
}

/**
 * 串行化预设创建期间的 cwd 切换。
 *
 * `conventional-changelog-cmyr-config` 从 `process.cwd()/package.json` 读取语言，
 * 而 `createPreset` 不接受 cwd 参数；切换是当前唯一最小改法。cwd 是进程级状态，
 * 故用模块内 promise 队列保证并发调用不交叉，并在成功 / 异常路径都恢复原值。
 */
let presetLock = Promise.resolve()

function withRepoCwd(repoRoot, task) {
    const run = presetLock.then(async () => {
        const previousCwd = process.cwd()
        try {
            if (previousCwd !== repoRoot) {
                process.chdir(repoRoot)
            }
            return await task()
        } finally {
            if (process.cwd() !== previousCwd) {
                process.chdir(previousCwd)
            }
        }
    })
    presetLock = run.catch(() => {})
    return run
}

export async function generateChangelog({ version, date, root } = {}) {
    validateOptions({ version, date })
    const repoRoot = root ?? REPO_ROOT
    if (repoRoot === REPO_ROOT && resolve(process.cwd()) !== REPO_ROOT) {
        throw new Error(`generate-changelog 须在仓库根运行（期望 ${REPO_ROOT}，当前 ${process.cwd()}）`)
    }

    const pkgName = await readPackageField('name', repoRoot)
    const nextVersion = version ?? (await readPackageField('version', repoRoot))

    // 预设的 writer 从 `process.cwd()/package.json` 读取 `changelog.language`（上游实现），
    // 直接调用会让「在别的目录生成 root 仓库的 changelog」串到调用方语言；生成期间切到
    // 目标仓库根，结束后恢复（脚本本身也要求默认根必须在仓库根运行）。
    const preset = await withRepoCwd(repoRoot, createPreset)
    preset.parser = {
        ...preset.parser,
        // 预置 headerPattern 不含 `!`，会把 `type(scope)!: …` 的 BREAKING CHANGE 提交整条丢弃；补 `!?`。
        headerPattern: /^(\w*)(?:\((.*)\))?!?: (.*)$/u,
        // 本仓提交正文常含 Vue 插槽名（如 `#option`）与十六进制色值（如 `#60a5fa`），
        // conventional-changelog 会用 hosted-git-info（GitHub）的 issuePrefixes 兜底，把它们
        // 误判为 issue 引用并生成失效链接；本仓未使用仓库 issue，故给出永不命中的前缀以关闭
        // 引用抽取（空数组 / null 会被兜底覆盖，无效果）。
        issuePrefixes: ['\u0000'],
    }

    // `outputUnreleased` 必须保持 true：指定版本时，conventional-changelog 把目标版本
    // 也作为「未发布段」输出，关掉会退回只输出最近一个已发布 tag 的段落。
    // 指定版本时在生成后剥掉**空**的 Unreleased 段（0.7.0 实测：同名 tag 已存在时
    // 重生成会得到「# Unreleased」+「# [0.7.0]」）；有内容的 Unreleased 段保留。
    const generator = new ConventionalChangelog(repoRoot)
        .readPackage(join(repoRoot, 'package.json'))
        .config(preset)
        .options({ releaseCount: 0, outputUnreleased: true })

    if (readOriginRemote(repoRoot)) {
        // 有 remote 时才读取仓库信息；commit 链接按远端生成。
        generator.readRepository()
    }

    const context = { version: nextVersion }
    if (date) {
        context.date = date
    }
    generator.context(context)

    let body = ''
    for await (const chunk of generator.write()) {
        body += chunk
    }

    const content = `# ${pkgName}\n\n${body}`.replace(/\n{3,}/gu, '\n\n')
    // 不论是否显式指定版本，都剥离**空**的 `# Unreleased` 段：`outputUnreleased: true`
    // 在「无未发布提交」时仍会输出标题，保留会让 CHANGELOG 首屏出现无内容标题。
    return stripEmptyUnreleasedSection(content)
}

/**
 * 移除 CHANGELOG 中**空**的 `# Unreleased (...)` 段。
 *
 * conventional-changelog 在指定版本、且同名 tag 已存在时，会把目标版本作为已发布段输出，
 * 同时在前面留一个空的 Unreleased 标题。空段不承载信息，保留会让同一份 CHANGELOG 出现
 * 两个版本标题；有内容的 Unreleased 段（预览尚未发布的提交）保持原样。
 *
 * 不变量：Unreleased 段必须紧跟在 `# <name>\n\n` 之后；上游格式变化（标题前加导语、
 * 出现第二段 Unreleased）时本函数静默不剥离（保守行为，不会误删相邻内容）。
 *
 * @param {string} content CHANGELOG 全文
 * @returns {string}
 */
export function stripEmptyUnreleasedSection(content) {
    return content.replace(
        /^(# [^\n]+\n\n)#\s+Unreleased[^\n]*\n([\s\S]*?)(?=\n#\s+|$)/u,
        (match, header, sectionBody) => {
            const meaningful = sectionBody
                .split(/\r?\n/u)
                .map((line) => line.trim())
                .filter((line) => line && !/^-{3,}$/u.test(line))
            return meaningful.length === 0 ? header : match
        },
    ).replace(/\n{3,}/gu, '\n\n')
}

async function main() {
    const options = parseArgs()
    const content = await generateChangelog(options)
    await writeFile(CHANGELOG_PATH, content, 'utf8')
    const head = content.split('\n').slice(0, 4).join('\n')
    process.stdout.write(`[generate-changelog] wrote ${CHANGELOG_PATH}\n${head}\n`)
}

if (isDirectExecution(import.meta.url)) {
    await main()
}
