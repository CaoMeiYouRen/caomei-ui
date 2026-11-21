#!/usr/bin/env node

/**
 * check-archive-index：深度归档分片**命名**与**索引覆盖**守卫。
 *
 * 为什么需要它：`docs/plan/archive/` 的分片由多轮归档压缩逐步累积，此前只靠人工核对
 * 「文件是否都在 `index.md` 里」「命名是否统一」。改名 / 迁出 / 手工新增任一环节漏一步，
 * 都会留下**无索引的孤儿分片**或**指向不存在文件的索引行**，链接门禁只覆盖被引用的方向，
 * 发现不了「文件存在但没人引用」。
 *
 * 规则（fail-closed）：
 * - T1 `naming`——归档目录下除 `index.md` 外的 `.md` 文件必须形如 `todo-archive-phases-<slug>.md`；
 * - T2 `missing-index`——每个归档分片必须在 `index.md` 中至少被链接一次；
 * - T3 `missing-file`——`index.md` 中指向同目录 `.md` 的链接目标必须存在；
 * - T4 `duplicate-index-row`——索引表中同一目标不得出现两行（同一事实两行）；
 * - T5 `scope-narrowed`——归档分片数低于下界，防止解析被静默削弱后「零命中即通过」；
 * - T6 `index-missing`——`docs/plan/archive/index.md` 不存在。
 *
 * 边界：只校验**同目录** `.md` 链接；指向 `../design/...` 等外部的链接不在本守卫面内
 * （由 `docs:check:links` 承担）。
 *
 * 用法：
 *   node scripts/governance/check-archive-index.mjs            # 仓库根；有问题 exit 1
 *   node scripts/governance/check-archive-index.mjs --root <dir>
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const ARCHIVE_DIR = 'docs/plan/archive'
export const INDEX_FILE = 'index.md'
export const FILE_PATTERN = /^todo-archive-phases-[0-9a-z-]+\.md$/

/** 受检分片数下界（防静默收窄；当前规模见 `ls`，不在注释复述）。 */
export const MIN_FILES = 10

/** 显式例外（当前为空；新增须逐项列出并写理由）。 */
export const EXPLICIT_SKIPS = new Set()

/** 失败码。 */
export const ISSUE_CODES = {
    naming: 'naming',
    missingIndex: 'missing-index',
    missingFile: 'missing-file',
    duplicateIndexRow: 'duplicate-index-row',
    scopeNarrowed: 'scope-narrowed',
    indexMissing: 'index-missing',
}

/**
 * 提取一行的 Markdown 链接目标。
 *
 * @param {string} line 行文本
 * @returns {string[]} 目标列表（不含锚点）
 */
export function linkTargets(line) {
    const targets = []
    const re = /\]\(([^)\s]+)\)/g
    let match
    while ((match = re.exec(line)) !== null) {
        targets.push(match[1].split('#')[0])
    }
    return targets
}

/**
 * 同目录 `.md` 目标归一化；非本目录目标返回 `null`。
 *
 * @param {string} target 链接目标
 * @returns {string | null} 归一化后的文件名
 */
export function sameDirFile(target) {
    if (!target || target.startsWith('http') || target.startsWith('#')) {
        return null
    }
    const normalized = target.split('#')[0].replace(/^\.\//, '')
    if (!normalized) {
        return null
    }
    if (normalized.includes('/') || !normalized.endsWith('.md') || normalized === INDEX_FILE) {
        return null
    }
    return normalized
}

/**
 * 校验归档目录与索引。
 *
 * @param {string} root 仓库根
 * @param {{ minFiles?: number }} [options] 测试可调下界；生产调用使用默认值
 * @returns {{ files: string[], issues: Array<{ code: string, detail: string }> }}
 */
export function checkArchiveIndex(root = REPO_ROOT, options = {}) {
    const minFiles = options.minFiles ?? MIN_FILES
    const dir = join(root, ARCHIVE_DIR)
    const index = join(dir, INDEX_FILE)
    const issues = []
    if (!existsSync(index)) {
        return { files: [], issues: [{ code: ISSUE_CODES.indexMissing, detail: `${ARCHIVE_DIR}/${INDEX_FILE} 不存在` }] }
    }
    const files = readdirSync(dir)
        .filter((name) => name.endsWith('.md') && name !== INDEX_FILE)
        .sort()
    for (const name of files) {
        if (EXPLICIT_SKIPS.has(name)) {
            continue
        }
        if (!FILE_PATTERN.test(name)) {
            issues.push({ code: ISSUE_CODES.naming, detail: `${ARCHIVE_DIR}/${name} 不符合 ${FILE_PATTERN}` })
        }
    }
    const lines = readFileSync(index, 'utf8').split(/\r?\n/)
    const linked = new Set()
    const tableTargets = new Map()
    for (const line of lines) {
        const targets = linkTargets(line)
        for (const target of targets) {
            const name = sameDirFile(target)
            if (!name) {
                continue
            }
            linked.add(name)
            if (!existsSync(join(dir, name))) {
                issues.push({ code: ISSUE_CODES.missingFile, detail: `${ARCHIVE_DIR}/${INDEX_FILE} 链接目标不存在：${name}` })
            }
        }
        if (line.startsWith('|')) {
            const first = targets.map(sameDirFile).find(Boolean)
            if (first) {
                if (tableTargets.has(first)) {
                    issues.push({ code: ISSUE_CODES.duplicateIndexRow, detail: `${ARCHIVE_DIR}/${INDEX_FILE} 索引表重复行：${first}` })
                }
                tableTargets.set(first, true)
            }
        }
    }
    for (const name of files) {
        if (!linked.has(name)) {
            issues.push({ code: ISSUE_CODES.missingIndex, detail: `${ARCHIVE_DIR}/${INDEX_FILE} 缺少分片链接：${name}` })
        }
    }
    if (files.length < minFiles) {
        issues.push({ code: ISSUE_CODES.scopeNarrowed, detail: `归档分片仅 ${files.length} 个，低于下界 ${minFiles}` })
    }
    return { files, issues }
}

if (isDirectExecution(import.meta.url)) {
    const rootFlag = process.argv.indexOf('--root')
    const root = rootFlag === -1 ? REPO_ROOT : resolve(process.argv[rootFlag + 1] ?? REPO_ROOT)
    const { files, issues } = checkArchiveIndex(root)
    if (issues.length === 0) {
        console.info(`[check-archive-index] OK：${files.length} 个归档分片命名与索引一致`)
        process.exit(0)
    }
    for (const issue of issues) {
        console.error(`[check-archive-index][error] ${issue.code}: ${issue.detail}`)
    }
    process.exit(1)
}
