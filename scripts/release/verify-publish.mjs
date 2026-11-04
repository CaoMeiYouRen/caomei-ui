#!/usr/bin/env node

/**
 * verify-publish：CI 发布后的门禁校验。
 *
 * 顺序（失败即 exit 1，workflow 标红）：
 * 1. `manual-release verify`：dist-tag、tarball shasum、解包 package.json、README 版本句；
 * 2. registry `exports` 键数 = 13；
 * 3. 可选 API 差分：`manual-release api-diff --base=<上一版本>`，使用发布前构建的 `dist`；
 *    删除 / 重命名 / required 收紧判 breaking，新增不阻断。
 *
 * 用法：
 *   node scripts/release/verify-publish.mjs --version=1.1.0 [--tag=latest] [--base=1.0.0]
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const PACKAGE_NAME = 'caomei-ui'
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/u

/** 1.1.0 的 `exports` 键数（发布后校验的固定验收面）。 */
export const EXPECTED_EXPORTS = 13

export function parseArgs(argv = process.argv) {
    return parseCliOptions(argv, {
        values: {
            '--version': { key: 'version' },
            '--tag': { key: 'tag' },
            '--base': { key: 'base' },
        },
        flags: {
            '--require-base': { key: 'requireBase' },
        },
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
 * 解析 `npm view <pkg> exports --json` 的键集合。
 *
 * @param {string} text JSON 输出
 * @returns {string[]}
 */
export function parseExportKeys(text) {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('registry exports 字段不是对象')
    }
    return Object.keys(parsed)
}

/**
 * 校验 exports 键数并返回键集合。
 *
 * @param {string[]} keys
 * @param {number} expected
 * @returns {string[]}
 */
export function assertExportCount(keys, expected = EXPECTED_EXPORTS) {
    if (keys.length !== expected) {
        throw new Error(`exports 键数 ${keys.length}，期望 ${expected}（${keys.join(' / ')}）`)
    }
    return keys
}

/**
 * 校验 registry 的 exports 键集合与本地 `package.json` 一致。
 *
 * 只比数量会漏掉「删一个加一个」；键集合相等才能证明发布产物与工作区导出一致。
 *
 * @param {string[]} registryKeys
 * @param {string[]} localKeys
 */
export function assertExportKeys(registryKeys, localKeys) {
    const registry = new Set(registryKeys)
    const local = new Set(localKeys)
    const missing = localKeys.filter((key) => !registry.has(key))
    const extra = registryKeys.filter((key) => !local.has(key))
    if (missing.length > 0 || extra.length > 0) {
        throw new Error(`exports 键集合与本地 package.json 不一致（缺失：${missing.join(' / ') || '无'}；多出：${extra.join(' / ') || '无'}）`)
    }
}

/** 同步等待（重试退避）。 */
function sleepSync(ms) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function run(command, args) {
    const result = spawnSync(command, args, { cwd: REPO_ROOT, stdio: 'inherit', shell: process.platform === 'win32' })
    if (result.status !== 0) {
        throw new Error(`命令失败（exit ${result.status}）：${command} ${args.join(' ')}`)
    }
}

function capture(command, args) {
    const result = spawnSync(command, args, { cwd: REPO_ROOT, encoding: 'utf8', shell: process.platform === 'win32' })
    if (result.status !== 0) {
        throw new Error(`命令失败（exit ${result.status}）：${command} ${args.join(' ')}\n${result.stderr ?? ''}`)
    }
    return result.stdout ?? ''
}

/**
 * registry 写入后的元数据可能有短时延迟；有限重试 + 退避，最终失败才判红。
 *
 * @param {() => void} task
 * @param {number} attempts
 * @param {number} delayMs
 */
function withRetry(task, attempts = 3, delayMs = 5000) {
    let lastError
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            task()
            return
        } catch (error) {
            lastError = error
            if (attempt < attempts) {
                process.stdout.write(`[verify-publish] 第 ${attempt} 次失败，${delayMs / 1000}s 后重试：${error.message}\n`)
                sleepSync(delayMs)
            }
        }
    }
    throw lastError
}

function localExportKeys() {
    const pkg = JSON.parse(readFileSync(join(REPO_ROOT, 'package.json'), 'utf8'))
    return Object.keys(pkg.exports ?? {})
}

/**
 * 执行发布后校验（可注入命令执行器，便于单测门禁顺序与失败语义）。
 *
 * @param {{ version: string, tag?: string, base?: string, requireBase?: boolean, runCommand?: Function, captureCommand?: Function, localKeys?: string[] }} options
 */
export function verifyPublishedPackage({
    version,
    tag = 'latest',
    base,
    requireBase = false,
    runCommand = run,
    captureCommand = capture,
    localKeys = localExportKeys(),
} = {}) {
    validateVersion(version)
    process.stdout.write(`[verify-publish] 校验 ${PACKAGE_NAME}@${version}（dist-tag ${tag}）\n`)
    withRetry(() => runCommand('node', ['scripts/release/manual-release.mjs', 'verify', `--version=${version}`, `--tag=${tag}`]))

    let keys
    withRetry(() => {
        keys = parseExportKeys(captureCommand('npm', ['view', `${PACKAGE_NAME}@${version}`, 'exports', '--json']))
    })
    assertExportCount(keys)
    assertExportKeys(keys, localKeys)
    process.stdout.write(`[verify-publish] exports ${keys.length} 键与本地一致 OK\n`)

    if (!base) {
        if (requireBase) {
            throw new Error('缺少 API 差分基线（--base），发布后校验不得跳过')
        }
        process.stdout.write('[verify-publish] 无可用基线，跳过 API 差分\n')
        return
    }
    if (base === version) {
        throw new Error(`API 差分基线不得等于目标版本（${version}）`)
    }

    process.stdout.write(`[verify-publish] API 差分：基线 ${base}\n`)
    runCommand('node', ['scripts/release/manual-release.mjs', 'api-diff', `--version=${version}`, `--tag=${tag}`, `--base=${base}`])
    process.stdout.write(`[verify-publish] OK：${version} 发布后校验全部通过\n`)
}

function main() {
    const options = parseArgs()
    verifyPublishedPackage(options)
}

if (isDirectExecution(import.meta.url)) {
    try {
        main()
    } catch (error) {
        process.stderr.write(`[verify-publish] ${error.message}\n`)
        process.exitCode = 1
    }
}
