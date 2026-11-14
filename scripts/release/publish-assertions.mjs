#!/usr/bin/env node

/**
 * publish-assertions：发布前置断言（版本句 / 许可证条目标题）。
 *
 * 独立成模块的原因：`manual-release.mjs` 已接近 ESLint `max-lines` 上限；这些断言同时被
 * 手动发布前置（`publish` 前）与产物校验（`verify` 的 tarball 断言）复用。
 */
import { readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { CURRENT_VERSION_STATEMENTS, statementFiles } from '../shared/version-statements.mjs'
import {
    collectRequiredPackages,
    DECLARATION_FILE,
    findDeclarationSection,
    normalizeText,
} from '../governance/check-licenses.mjs'

/** 读取 `package.json` 的版本。 */
function readPackageVersion(root) {
    return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version
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
 * 断言许可证条目标题版本与安装版本一致。
 *
 * @param {string} ledgerText `THIRD-PARTY-LICENSES` 全文
 * @param {Array<{ name: string, installed: boolean, version?: string }>} packages 运行时依赖清单
 * @returns {string[]} 问题清单（空数组表示通过）
 */
export function assertLedgerTitles(ledgerText, packages = []) {
    const problems = []
    const normalized = normalizeText(ledgerText)
    for (const item of packages) {
        // 未安装时无法确定安装版本；该情形由 `check-licenses` 在 verify 阶段硬失败，
        // 这里跳过以免把「依赖没装」误报成「标题不一致」。
        if (!item.installed) {
            continue
        }
        const entry = findDeclarationSection(normalized, item.name)
        if (entry === undefined) {
            problems.push(`${item.name}：声明缺少条目`)
        } else if (entry.duplicates > 1) {
            problems.push(`${item.name}：声明存在重复条目`)
        } else if (entry.version !== item.version) {
            problems.push(`${item.name}：条目标题 ${entry.version}，期望 ${item.version}`)
        }
    }
    return problems
}

/**
 * 发布前置断言：`package.json` 版本、全部「当前版本」声明句与许可证条目标题都必须是目标状态。
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
    // 许可证条目标题在 publish 前核对：check-licenses 对标题滞后只告警（自动合并路径），
    // 跳过 sync 直接 publish 时由这里 fail-closed，避免把陈旧标题打进 tarball。
    let ledger
    try {
        ledger = readFileSync(resolve(root, DECLARATION_FILE), 'utf8')
    } catch {
        problems.push(`${DECLARATION_FILE}：文件缺失或不可读`)
    }
    if (ledger !== undefined) {
        let packages
        try {
            packages = collectRequiredPackages(root)
        } catch (error) {
            problems.push(`依赖清单不可读：${error.message}`)
        }
        if (packages !== undefined) {
            problems.push(...assertLedgerTitles(ledger, packages))
        }
    }
    return problems
}
