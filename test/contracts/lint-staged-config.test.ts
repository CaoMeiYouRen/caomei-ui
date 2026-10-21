import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * lint-staged 配置契约守卫。
 *
 * 契约：提交钩子只能对**本次暂存的文件**执行修复，不得触发全仓 lint，也不得裸 `git add`。
 * lint-staged 会把命中的暂存文件追加到命令末尾，并自动重新暂存其修改；一旦命令写成
 * `eslint .` / `eslint --fix src` / `npm run lint`，`--fix` 会改写工作区里与本次提交无关
 * 的文件，裸 `git add` 再把它们一并纳入暂存集（本仓已实测两次）。
 *
 * 受检面 = `package.json` 的 `lint-staged` 配置、`docs/standards/git.md` 的口径句与
 * `.husky/pre-commit` 的调用形态。本守卫只校验配置形态；真实提交行为由临时仓库负向对照取证。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PACKAGE_JSON = join(REPO_ROOT, 'package.json')
const PRE_COMMIT = join(REPO_ROOT, '.husky', 'pre-commit')
const GIT_DOC = join(REPO_ROOT, 'docs', 'standards', 'git.md')

/** 会产生「全仓 / 非暂存文件」副作用的非 eslint 命令形态。 */
const UNSCOPED_COMMAND_PATTERNS: { pattern: RegExp, reason: string }[] = [
    { pattern: /\bnpm\s+run\b/, reason: '脚本别名会把文件参数追加到整条脚本之后，仍按脚本自身的作用域执行' },
    { pattern: /\bpnpm\s+run\b/, reason: '脚本别名会把文件参数追加到整条脚本之后，仍按脚本自身的作用域执行' },
    { pattern: /\bgit\s+add\b/, reason: '裸 git add 会把工作区其它未暂存改动一并入暂存（lint-staged 已自动重新暂存）' },
]

/** 带独立取值参数的 eslint flag（其后的 token 不是文件目标）。 */
const VALUE_FLAGS = new Set([
    '-c',
    '--config',
    '--ext',
    '-f',
    '--format',
    '--ignore-pattern',
    '--max-warnings',
    '-o',
    '--output-file',
    '--parser-options',
    '--resolve-plugins-relative-to',
])

type LintStagedConfig = Record<string, string | string[]>

interface PackageConfig {
    'lint-staged'?: LintStagedConfig
    scripts?: Record<string, string>
}

function readConfig(): { config: LintStagedConfig, preCommit: string, scripts: Record<string, string> } {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf8')) as PackageConfig
    return {
        config: pkg['lint-staged'] ?? {},
        preCommit: readFileSync(PRE_COMMIT, 'utf8'),
        scripts: pkg.scripts ?? {},
    }
}

function commandsOf(config: LintStagedConfig): string[] {
    return Object.values(config).flatMap((value) => Array.isArray(value) ? value : [value])
}

/** 从 `*.{js,mjs}` 形态还原扩展名集合；无花括号时退化为单扩展名。 */
function globExtensions(glob: string): string[] {
    const brace = /\{([^}]+)\}/u.exec(glob)
    const parts = brace ? brace[1].split(',') : [glob]
    return parts.map((part) => part.trim().replace(/^\*\./u, ''))
}

/** 剥掉成对外层引号，便于比较路径类实参。 */
function stripQuotes(token: string): string {
    return token.replace(/^['"]|['"]$/gu, '')
}

/**
 * eslint 命令是否携带路径 / 目录 / glob 目标。
 *
 * lint-staged 会在命令末尾追加暂存文件，故配置里的 eslint 只允许出现 flag；
 * 任何非 flag 实参（`.`、`src`、`'./src'`、`**\/*.ts`）都意味着扫描面被写死。
 */
function eslintHasPathTarget(command: string): boolean {
    const tokens = command.trim().split(/\s+/u).map(stripQuotes)
    const eslintIndex = tokens.findIndex((token) => /(?:^|\/)eslint$/u.test(token))
    if (eslintIndex === -1) {
        return false
    }
    for (let index = eslintIndex + 1; index < tokens.length; index++) {
        const token = tokens[index]
        if (!token) {
            continue
        }
        if (token.startsWith('-')) {
            if (VALUE_FLAGS.has(token)) {
                index++
            }
            continue
        }
        return true
    }
    return false
}

describe('lint-staged 配置契约', () => {
    it('配置存在且受检面未收窄', () => {
        const { config } = readConfig()
        const extensions = new Set(Object.keys(config).flatMap(globExtensions))

        expect(extensions.size).toBeGreaterThanOrEqual(5)
        for (const extension of ['js', 'mjs', 'cjs', 'ts', 'vue']) {
            expect(extensions.has(extension), `缺少 ${extension} 的 glob`).toBe(true)
        }
    })

    it('命令只作用于暂存文件，不触发全仓副作用', () => {
        const { config } = readConfig()
        const commands = commandsOf(config)

        expect(commands.length).toBeGreaterThanOrEqual(1)
        for (const command of commands) {
            for (const { pattern, reason } of UNSCOPED_COMMAND_PATTERNS) {
                expect(pattern.test(command), `${command} → ${reason}`).toBe(false)
            }
            expect(eslintHasPathTarget(command), `${command} → eslint 不应携带路径目标`).toBe(false)
        }
    })

    it('识别 eslint 的各种全仓 / 目录目标形态', () => {
        const unscoped = [
            'eslint .',
            'eslint . --fix',
            'eslint --fix .',
            'eslint ./src',
            'eslint --fix \'./src\'',
            'eslint --fix src',
            'eslint --fix **/*.ts',
            'pnpm exec eslint --fix ./src',
            'eslint --ext .ts src',
        ]

        for (const command of unscoped) {
            expect(eslintHasPathTarget(command), command).toBe(true)
        }
        for (const command of ['eslint --fix', 'cross-env NODE_ENV=production eslint --fix', 'eslint --config ./eslint.config.js --fix']) {
            expect(eslintHasPathTarget(command), command).toBe(false)
        }
    })

    it('修复命令保留与 lint 脚本一致的 NODE_ENV', () => {
        const { config, scripts } = readConfig()
        const commands = commandsOf(config)

        expect(scripts.lint).toContain('NODE_ENV=production')
        expect(
            commands.some((command) => command.includes('NODE_ENV=production')
                && /\beslint\b/u.test(command)
                && command.includes('--fix')),
        ).toBe(true)
    })

    it('规范载体登记与配置保持同一 glob', () => {
        const { config } = readConfig()
        const gitDoc = readFileSync(GIT_DOC, 'utf8')

        for (const glob of Object.keys(config)) {
            expect(gitDoc, `docs/standards/git.md 缺少 ${glob}`).toContain(glob)
        }
    })

    it('pre-commit 通过 pnpm 调用 lint-staged，且守卫排在 lint-staged 之前', () => {
        const { preCommit } = readConfig()

        expect(preCommit).toContain('pnpm exec lint-staged')
        expect(/\bnpx\b/u.test(preCommit)).toBe(false)

        const reviewGateIndex = preCommit.indexOf('check-review-gate-artifacts.mjs')
        const stagingHygieneIndex = preCommit.indexOf('check-staging-hygiene.mjs')
        const lintStagedIndex = preCommit.indexOf('pnpm exec lint-staged')

        expect(reviewGateIndex).toBeGreaterThanOrEqual(0)
        expect(stagingHygieneIndex).toBeGreaterThan(reviewGateIndex)
        expect(lintStagedIndex).toBeGreaterThan(stagingHygieneIndex)
    })
})
