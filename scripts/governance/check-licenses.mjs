#!/usr/bin/env node

/**
 * check-licenses：第三方许可合规校验脚本。
 *
 * 检查项：
 * 1. 声明文件 `THIRD-PARTY-LICENSES` 存在；
 * 2. `package.json` 的 `files` 包含该声明，确保随发布产物分发；
 * 3. `dependencies` + `peerDependencies` 中的每个包都有 `## <name>@<version>` 条目；
 * 4. 条目声明的 `License:` 与安装版本的 license 字段一致；
 * 5. 条目包含该包 LICENSE 全文（归一化后逐字匹配 node_modules 中的文件）。
 *
 * 用法：
 *   node scripts/governance/check-licenses.mjs   # 有问题 exit 1
 *
 * 维护：新增 / 升级运行时依赖或 peer 依赖后，需同步更新 `THIRD-PARTY-LICENSES` 中该包的
 * `## <name>@<version>` 标题与许可证全文（可从 `node_modules/<pkg>/LICENSE` 复制）。
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

function escapeRegExp(text) {
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

        const heading = `## ${item.name}@${item.version}`
        const section = extractSection(declaration, heading)
        if (section === undefined) {
            errors.push(`声明缺少 ${item.name}@${item.version} 条目（期望标题：${heading}）`)
            continue
        }

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
        } else if (!section.includes(licenseText)) {
            errors.push(`${item.name} 条目未包含其许可证全文（与 node_modules 中的 LICENSE 不一致）`)
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
