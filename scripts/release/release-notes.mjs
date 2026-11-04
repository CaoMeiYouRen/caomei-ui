#!/usr/bin/env node

/**
 * release-notes：为 semantic-release 追加里程碑 / 升级注意段。
 *
 * 机制：由 `@semantic-release/exec` 的 `generateNotesCmd` 调用；semantic-release 会把本脚本输出
 * 追加在 `@semantic-release/release-notes-generator` 的提交分组之后。文件缺失时输出空串，
 * 不影响普通 patch / minor 发布。
 *
 * 约定：里程碑文案放在 `docs/release-notes/<version>.md`，随仓库提交；发布时只读不写，
 * 因此 `CHANGELOG` 重写不会覆盖该段。
 *
 * 用法：
 *   node scripts/release/release-notes.mjs --version=1.1.0
 */
import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution, parseCliOptions } from '../shared/cli.mjs'

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
 * 读取里程碑文案；缺失时返回空串。
 *
 * @param {{ version: string, root?: string }} options
 * @returns {string}
 */
export function readReleaseNotes({ version, root = REPO_ROOT }) {
    validateVersion(version)
    const file = resolve(root, 'docs/release-notes', `${version}.md`)
    if (!existsSync(file)) {
        return ''
    }
    return readFileSync(file, 'utf8').trim()
}

function main() {
    const options = parseArgs()
    const notes = readReleaseNotes(options)
    if (notes) {
        process.stdout.write(`${notes}\n`)
    }
}

if (isDirectExecution(import.meta.url)) {
    try {
        main()
    } catch (error) {
        process.stderr.write(`[release-notes] ${error.message}\n`)
        process.exitCode = 1
    }
}
