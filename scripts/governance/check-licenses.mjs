#!/usr/bin/env node

/**
 * check-licenses：第三方许可合规校验脚本。
 *
 * 检查项：
 * 1. 声明文件 `THIRD-PARTY-LICENSES` 存在；
 * 2. `package.json` 的 `files` 包含该声明，确保随发布产物分发；
 * 3. `dependencies` + `peerDependencies` 中的每个包都有 `## <name>@<version>` 条目（按包名匹配）；
 * 4. 条目声明的 `License:` 与安装版本的 license 字段一致；
 * 5. 条目包含该包 LICENSE 全文（归一化后逐字匹配 node_modules 中的文件）。
 *
 * 标题版本与安装版本不一致时**不直接失败**：只要 `License:` 与许可证全文仍然一致，记 warning
 * 通过，使 dependabot / 常规升级 PR 可在许可证未变化时自动合并。标题版本由发布链的
 * `scripts/release/sync-license-titles.mjs` 在 `prepare` 阶段同步并随发布提交回写，避免版本号长期陈旧；
 * 许可证文本发生变化时才要求人工更新全文。
 *
 * 用法：
 *   node scripts/governance/check-licenses.mjs   # 有问题 exit 1
 *
 * 维护：新增运行时依赖或 peer 依赖、或依赖的许可证文本变化时，需同步更新
 * `THIRD-PARTY-LICENSES` 中该包的条目与全文（可从 `node_modules/<pkg>/LICENSE` 复制）；
 * 仅版本号变化时由发布链自动同步。
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')

export const DECLARATION_FILE = 'THIRD-PARTY-LICENSES'

const LICENSE_FILE_CANDIDATES = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'LICENSE-MIT']

/** 归一化文本：统一换行、去掉每行尾部空白、去掉整体首尾空白。 */
export function normalizeText(text) {
    return text
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map((line) => line.trimEnd())
        .join('\n')
        .trim()
}

function readJson(file) {
    return JSON.parse(readFileSync(file, 'utf8'))
}

export function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 需要声明许可的运行时依赖：dependencies + peerDependencies。 */
export function collectRequiredPackages(root = REPO_ROOT) {
    const pkg = readJson(join(root, 'package.json'))
    const names = new Set([
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.peerDependencies ?? {}),
    ])

    return [...names].sort().map((name) => {
        const pkgFile = join(root, 'node_modules', name, 'package.json')
        if (!existsSync(pkgFile)) {
            return { name, installed: false }
        }

        const installed = readJson(pkgFile)
        const license = typeof installed.license === 'string'
            ? installed.license
            : installed.license?.type

        return { name, installed: true, version: installed.version, license }
    })
}

/** 读取已安装包的许可证全文（归一化）。 */
export function readLicenseText(root, name) {
    for (const candidate of LICENSE_FILE_CANDIDATES) {
        const file = join(root, 'node_modules', name, candidate)
        if (existsSync(file)) {
            return normalizeText(readFileSync(file, 'utf8'))
        }
    }
    return undefined
}

/** 截取声明文件中某个条目（从标题行起，到下一个二级标题行之前）。 */
export function extractSection(declaration, heading) {
    // 仅匹配行首标题，避免许可证正文中的同形文本造成误截断
    let start = declaration.startsWith(heading) ? 0 : declaration.indexOf(`\n${heading}`)
    if (start === -1) {
        return undefined
    }
    if (start !== 0) {
        start += 1
    }
    const next = declaration.indexOf('\n## ', start + heading.length)
    return next === -1 ? declaration.slice(start) : declaration.slice(start, next)
}

/**
 * 去掉文本开头的空行与 `License:` / `Copyright:` 等头部行（两侧对称使用）。
 *
 * @param {string} text 条目或 LICENSE 原文
 * @returns {string} 去头部后的正文
 */
export function stripLeadingHeader(text) {
    const lines = text.split('\n')
    const headerPattern = /^(License|Copyright|Homepage|Source|Repository)\s*:/iu
    let index = 0
    while (index < lines.length) {
        if (lines[index].trim() === '' || headerPattern.test(lines[index])) {
            index += 1
            continue
        }
        break
    }
    return lines.slice(index).join('\n').trim()
}

/**
 * 截取条目正文（去掉标题行与头部行）。
 *
 * @param {string} section 条目全文
 * @returns {string} 归一化前的许可证正文
 */
export function extractLicenseBody(section) {
    return stripLeadingHeader(section.split('\n').slice(1).join('\n'))
        // 声明文件在条目之间可能夹带文件级说明块（以 `---` 分隔），不属于许可证正文
        .replace(/\n*---\n+说明：以上仅列出[\s\S]*$/u, '')
        .trim()
}

/**
 * 按包名查找声明条目（标题版本可落后于安装版本）。
 *
 * @param {string} declaration 声明文件全文（已归一化）
 * @param {string} name 包名
 * @returns {{ version: string, heading: string, section: string, duplicates: number } | undefined}
 */
export function findDeclarationSection(declaration, name) {
    const pattern = new RegExp(`^## ${escapeRegExp(name)}@([^\\s]+)[ \\t]*$`, 'gmu')
    const matches = [...declaration.matchAll(pattern)]
    if (matches.length === 0) {
        return undefined
    }
    const version = matches[0][1]
    const heading = `## ${name}@${version}`
    return {
        version,
        heading,
        section: extractSection(declaration, heading) ?? '',
        duplicates: matches.length,
    }
}

/** 执行校验，返回 { ok, errors, warnings }。 */
export function checkLicenses(root = REPO_ROOT) {
    const errors = []
    const warnings = []

    const declarationPath = join(root, DECLARATION_FILE)
    if (!existsSync(declarationPath)) {
        return {
            ok: false,
            errors: [`缺少第三方许可声明文件 ${DECLARATION_FILE}`],
            warnings,
        }
    }

    const declaration = normalizeText(readFileSync(declarationPath, 'utf8'))

    // 1. 随发布产物分发
    const pkg = readJson(join(root, 'package.json'))
    const files = pkg.files ?? []
    if (!files.includes(DECLARATION_FILE)) {
        errors.push(`package.json 的 files 未包含 ${DECLARATION_FILE}，发布产物将丢失声明`)
    }

    // 2. 逐个运行时依赖核对条目、License 标识与许可证全文
    for (const item of collectRequiredPackages(root)) {
        if (!item.installed) {
            errors.push(`运行时依赖 ${item.name} 未安装，无法核对许可证`)
            continue
        }

        const entry = findDeclarationSection(declaration, item.name)
        if (entry === undefined || entry.section === '') {
            errors.push(`声明缺少 ${item.name} 条目（期望标题：## ${item.name}@${item.version}）`)
            continue
        }
        if (entry.duplicates > 1) {
            errors.push(`声明中存在 ${entry.duplicates} 个 ${item.name} 条目，无法确定应采用哪一个`)
            continue
        }
        const section = entry.section

        const licenseText = readLicenseText(root, item.name)

        if (!item.license && !licenseText) {
            errors.push(`${item.name} 既无 license 元数据也无 LICENSE 文件，无法确认其许可证`)
            continue
        }

        if (!item.license) {
            warnings.push(`${item.name} 的 package.json 未声明 license 字段`)
        } else {
            const licensePattern = new RegExp(`(^|\\n)License:\\s*${escapeRegExp(item.license)}\\s*(\\n|$)`)
            if (!licensePattern.test(section)) {
                errors.push(`${item.name} 条目声明的 License 与安装版本（${item.license}）不一致`)
            }
        }

        if (!licenseText) {
            warnings.push(`${item.name} 未找到 LICENSE 文件，跳过许可证全文核对`)
        } else {
            // 两侧同规则剥离头部行后比较，避免「安装包 LICENSE 自身以 Copyright: 开头」时误报；
            // 要求归一化后相等，避免「安装包文本变短、恰为旧文本子集」这类许可证变化被子串匹配漏过。
            const body = normalizeText(extractLicenseBody(section))
            const installed = normalizeText(stripLeadingHeader(licenseText))
            if (body === '' || installed === '') {
                errors.push(`${item.name} 条目或安装包 LICENSE 只有头部行，缺少许可证正文`)
            } else if (body !== installed) {
                errors.push(`${item.name} 条目许可证全文与 node_modules 中的 LICENSE 不一致（归一化后不相等）`)
            }
        }

        if (entry.version !== item.version) {
            warnings.push(
                `${item.name} 条目标题版本 ${entry.version} 与安装版本 ${item.version} 不一致；`
                + '许可证未变化可通过，发布链会在 prepare 阶段同步标题（scripts/release/sync-license-titles.mjs）',
            )
        }
    }

    return { ok: errors.length === 0, errors, warnings }
}

if (isDirectExecution(import.meta.url)) {
    const result = checkLicenses()
    for (const warning of result.warnings) {
        console.warn(`[check-licenses][warn] ${warning}`)
    }

    if (result.ok) {
        console.info('[check-licenses] 通过：第三方许可声明覆盖全部运行时依赖')
        process.exit(0)
    }

    for (const error of result.errors) {
        console.error(`[check-licenses][error] ${error}`)
    }
    process.exit(1)
}
