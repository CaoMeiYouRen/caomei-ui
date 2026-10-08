#!/usr/bin/env node

/**
 * check-final-newline：文件末尾换行守卫（`.editorconfig` 的 `insert_final_newline = true`）。
 *
 * 为什么需要它：仓库 `.editorconfig` 声明 `[*] insert_final_newline = true`，但此前**没有机检载体**。
 * 漂移会带来实际后果——`npm version`（`@npmcli/package-json`）在改写清单时会**补**末尾换行，使暂存
 * diff 多出一个非版本行 hunk，进而让 `check-review-gate-artifacts` 的「发布元数据豁免」失效、阻断发布
 * （2026-10-08 `npm version 0.6.0` 受阻即此因；同源漂移另有 9 个文件，见 git 历史）。
 *
 * 规则：
 * - T1 `missing-final-newline`——受检文本文件未以换行（`\n`）结尾；
 * - T2 `scope-narrowed`——受检文件数低于下界（防静默收窄）；
 * - T3 `sentinel-missing`——哨兵文件不在受检面；
 * - T4 `premise-changed`——`.editorconfig` 的 `[*]` 未声明 `insert_final_newline = true`（守卫前提失效，须显式处置）。
 *
 * 受检面（显式）：`git ls-files` 列出的**受版本控制**文件，排除符号链接 / 非普通文件 / 空文件 /
 * 二进制文件（前 8 KiB 含 NUL）。`EXPLICIT_SKIPS` 为显式例外（须逐项列出，不得用通配）。
 *
 * 用法：
 *   node scripts/governance/check-final-newline.mjs            # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-final-newline.mjs --root <dir>
 */
import { existsSync, lstatSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 二进制探测窗口（字节）。 */
export const BINARY_PROBE_BYTES = 8192

/** 受检面下界（防静默收窄；2026-10-08 实测受检 1169 文件）。 */
export const SCOPE_FLOOR = { files: 1000 }

/** 哨兵文件：必须在受检面内。 */
export const SENTINELS = ['package.json', 'src/styles/field-shell.css']

/** 显式例外（相对仓库根；当前为空——所有受控文本文件都应带末尾换行）。 */
export const EXPLICIT_SKIPS = new Set([])

/**
 * 是否以换行结尾。
 *
 * @param {Buffer} buffer 文件字节
 * @returns {boolean}
 */
export function hasFinalNewline(buffer) {
    return buffer.length > 0 && buffer[buffer.length - 1] === 0x0a
}

/**
 * 是否疑似二进制（前 {@link BINARY_PROBE_BYTES} 字节含 NUL）。
 *
 * **探测窗口边界**：仅看前 8 KiB——「窗口内无 NUL、其后才出现 NUL」的文件会被判为文本
 * （可能误报末尾换行）；末字节恰为 `0x0a` 的二进制则可能漏报。本仓当前无受控二进制文件，
 * 风险可接受；若将来引入，须把此类文件加入 `EXPLICIT_SKIPS` 或改用内容嗅探。
 *
 * @param {Buffer} buffer 文件字节
 * @returns {boolean}
 */
export function isBinary(buffer) {
    const probe = buffer.subarray(0, BINARY_PROBE_BYTES)
    return probe.includes(0x00)
}

/**
 * 解析 `.editorconfig`：`[*]` 段的 `insert_final_newline` 是否为 `true`。
 *
 * 行式解析（忽略注释 / 空行）；同一 `[*]` 段多次出现时**后值覆盖**前值。其它段的同名键不影响 `[*]`。
 *
 * @param {string} text `.editorconfig` 内容
 * @returns {boolean}
 */
export function parseInsertFinalNewline(text) {
    let section = null
    let value = null
    for (const raw of text.split(/\r?\n/)) {
        const line = raw.trim()
        if (!line || line.startsWith('#') || line.startsWith(';')) {
            continue
        }
        const sectionMatch = line.match(/^\[(.+)\]$/)
        if (sectionMatch) {
            section = sectionMatch[1].trim()
            continue
        }
        const kv = line.match(/^([^=]+?)\s*=\s*(.*)$/)
        if (kv && section === '*') {
            if (kv[1].trim().toLowerCase() === 'insert_final_newline') {
                value = kv[2].trim().toLowerCase()
            }
        }
    }
    return value === 'true'
}

/**
 * `git ls-files` 列出受版本控制文件（相对仓库根）。
 *
 * @param {string} root 仓库根
 * @returns {string[] | null} git 失败时返回 null
 */
export function collectTrackedFiles(root) {
    const result = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' })
    if (result.status !== 0) {
        return null
    }
    return result.stdout.split('\0').filter(Boolean)
}

/**
 * 扫描给定相对路径集合的末尾换行。
 *
 * 跳过：显式例外 / 符号链接与非普通文件 / 空文件 / 二进制文件。
 *
 * @param {string} root 仓库根
 * @param {string[]} relPaths 相对路径列表
 * @returns {{ checked: number, checkedFiles: string[], issues: Array<{ code: string, detail: string }> }}
 */
export function scanPaths(root, relPaths) {
    const issues = []
    const checkedFiles = []
    for (const rel of relPaths) {
        if (EXPLICIT_SKIPS.has(rel)) {
            continue
        }
        const abs = join(root, rel)
        let stat
        try {
            stat = lstatSync(abs)
        } catch {
            continue
        }
        if (stat.isSymbolicLink() || !stat.isFile()) {
            continue
        }
        let buffer
        try {
            buffer = readFileSync(abs)
        } catch {
            continue
        }
        if (buffer.length === 0 || isBinary(buffer)) {
            continue
        }
        checkedFiles.push(rel)
        if (!hasFinalNewline(buffer)) {
            issues.push({ code: 'missing-final-newline', detail: rel })
        }
    }
    return { checked: checkedFiles.length, checkedFiles, issues }
}

/**
 * 校验仓库（前提 + 受检 + 下界 + 哨兵）。
 *
 * @param {string} root 仓库根
 * @param {{ enforceScope?: boolean }} [options]
 * @returns {{ checked: number, files: string[], issues: Array<{ code: string, detail: string }> }}
 */
export function checkRepo(root, { enforceScope = true } = {}) {
    const issues = []
    const editorconfigPath = join(root, '.editorconfig')
    const premiseHolds =
        existsSync(editorconfigPath)
        && parseInsertFinalNewline(readFileSync(editorconfigPath, 'utf8'))
    if (!premiseHolds) {
        issues.push({
            code: 'premise-changed',
            detail: '.editorconfig 的 [*] 未声明 insert_final_newline = true（守卫前提失效，须显式处置）',
        })
    }

    const files = collectTrackedFiles(root)
    if (files === null) {
        issues.push({ code: 'git-error', detail: 'git ls-files 执行失败' })
        return { checked: 0, files: [], issues }
    }

    const { checked, checkedFiles, issues: missing } = scanPaths(root, files)
    issues.push(...missing)

    if (enforceScope) {
        if (checked < SCOPE_FLOOR.files) {
            issues.push({ code: 'scope-narrowed', detail: `受检文件数 ${checked} 低于下界 ${SCOPE_FLOOR.files}` })
        }
        for (const sentinel of SENTINELS) {
            if (!checkedFiles.includes(sentinel)) {
                issues.push({ code: 'sentinel-missing', detail: `哨兵文件不在受检集合：${sentinel}` })
            }
        }
    }
    return { checked, files, issues }
}

export function main(argv = process.argv.slice(2)) {
    let root = REPO_ROOT
    if (argv.length > 0) {
        if (argv[0] === '--root' && argv[1]) {
            root = resolve(argv[1])
        } else {
            console.error(`[check-final-newline] 不支持的参数：${argv.join(' ')}`)
            return 2
        }
    }
    if (!existsSync(root)) {
        console.error(`[check-final-newline] 目标目录不存在：${root}`)
        return 2
    }

    const { checked, issues } = checkRepo(root)
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-final-newline][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-final-newline] ${issues.length} 处问题（受检 ${checked} 文件）`)
        return 1
    }
    console.info(`[check-final-newline] OK：受检 ${checked} 个受控文本文件均以换行结尾`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
