#!/usr/bin/env node

/**
 * sync-license-titles：把 `THIRD-PARTY-LICENSES` 的条目标题版本同步到已安装版本。
 *
 * 为什么需要它：许可证全文由 `check-licenses` 逐字核对，但标题里的版本号会随依赖升级陈旧。
 * 若把「标题版本 = 安装版本」作为硬失败条件，dependabot / 常规升级 PR 每次都需人工改一行标题，
 * 自动合并路径因此长期红灯。这里改为：校验只看许可证文本，标题版本由发布链在 `prepare` 阶段
 * 同步并随发布提交回写（`@semantic-release/git` 的 assets 包含本文件）。
 *
 * 只改 `## <name>@<version>` 行的版本号，条目正文（License / Copyright / 全文）不动；
 * 许可证文本本身变化时 `check-licenses` 仍会失败并要求人工更新全文。
 *
 * 用法：
 *   node scripts/release/sync-license-titles.mjs
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'
import {
    collectRequiredPackages,
    DECLARATION_FILE,
    escapeRegExp,
    REPO_ROOT,
} from '../governance/check-licenses.mjs'

/**
 * 同步条目标题版本。
 *
 * @param {string} root 仓库根目录
 * @returns {{ changed: boolean, updates: Array<{ name: string, from: string, to: string }> }}
 */
export function syncLicenseTitles(root = REPO_ROOT) {
    const file = join(root, DECLARATION_FILE)
    if (!existsSync(file)) {
        throw new Error(`缺少第三方许可声明文件 ${DECLARATION_FILE}`)
    }

    const original = readFileSync(file, 'utf8')
    let content = original
    const updates = []
    const notInstalled = []
    const missing = []
    const duplicated = []

    for (const item of collectRequiredPackages(root)) {
        if (!item.installed) {
            notInstalled.push(item.name)
            continue
        }
        const pattern = new RegExp(`^## ${escapeRegExp(item.name)}@([^\\s]+)[ \\t]*$`, 'gmu')
        const matches = [...content.matchAll(pattern)]
        if (matches.length === 0) {
            missing.push(item.name)
            continue
        }
        if (matches.length > 1) {
            duplicated.push(item.name)
            continue
        }
        const [match] = matches
        if (match[1] === item.version) {
            continue
        }
        content = `${content.slice(0, match.index)}## ${item.name}@${item.version}${content.slice(match.index + match[0].length)}`
        updates.push({ name: item.name, from: match[1], to: item.version })
    }

    // fail-closed：声明缺条目 / 重复条目 / 依赖未安装时不能假装「无需更新」，
    // 否则发布链会带着不完整声明继续走到 publish 才失败。
    if (notInstalled.length > 0) {
        throw new Error(`以下依赖未安装，无法确定标题版本：${notInstalled.join(' / ')}（先执行 pnpm install）`)
    }
    if (missing.length > 0) {
        throw new Error(`以下依赖在 ${DECLARATION_FILE} 中缺少条目：${missing.join(' / ')}`)
    }
    if (duplicated.length > 0) {
        throw new Error(`以下依赖在 ${DECLARATION_FILE} 中存在重复条目：${duplicated.join(' / ')}`)
    }

    if (updates.length > 0) {
        writeFileSync(file, content)
    }
    return { changed: updates.length > 0, updates }
}

function main() {
    const { changed, updates } = syncLicenseTitles()
    if (!changed) {
        console.info(`[sync-license-titles] 无需更新：${DECLARATION_FILE} 条目版本与安装版本一致`)
        return
    }
    for (const update of updates) {
        console.info(`[sync-license-titles] ${update.name}: ${update.from} → ${update.to}`)
    }
    console.info(`[sync-license-titles] 已更新 ${updates.length} 条`)
}

if (isDirectExecution(import.meta.url)) {
    try {
        main()
    } catch (error) {
        console.error(`[sync-license-titles] ${error.message}`)
        process.exitCode = 1
    }
}
