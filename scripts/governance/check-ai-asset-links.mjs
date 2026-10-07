#!/usr/bin/env node

/**
 * check-ai-asset-links：AI 资产（GitHub 渲染面）相对链接与锚点的机检守卫。
 *
 * 为什么需要它：`AGENTS.md`、`CLAUDE.md`、`.github/**` 下的 md 由 **GitHub** 渲染，锚点须用
 * **GitHub slug**（数字开头的标题**不补** `_`，如 `#5-任务粒度约束`）；而 `docs/**` 由 VitePress
 * 渲染，同一标题的 slug **带** `_` 前缀（`#_5-任务粒度约束`）。两种形态**不通用**，写错会静默
 * 落到文件顶部。`docs:check:links` 只做路径与「宽松锚点归一化」（两种形态都能过），
 * `docs:check:structure` 的 VitePress slug 校验只覆盖 `docs/` 内站内链接——`.github/**` 的锚点
 * 形态此前**不被任何门禁校验**（该缺口曾导致一处有效锚点被误改为失效锚点）。
 *
 * 规则：
 * - T1 `missing-target`——相对链接目标文件不存在；
 * - T2 `bad-anchor`——带锚点的相对链接，其锚点不在目标的 **GitHub slug** 标题集合内；
 * - T3 `scope-narrowed` / 哨兵——受检文件数下界 + 哨兵文件身份断言，防静默收窄。
 *
 * 受检面（显式）：`AGENTS.md`、`CLAUDE.md`、`.github/**` 下的 md。**不含** `docs/**`（VitePress 面，
 * 由 `docs:check:structure` 按 VitePress slug 覆盖）与 `.claude` / `.opencode` 镜像（符号链接到 .github）。
 * 围栏代码块与行内 code span 内的示例链接不参与判定。
 *
 * 用法：
 *   node scripts/governance/check-ai-asset-links.mjs                 # 受检仓库根；有问题 exit 1
 *   node scripts/governance/check-ai-asset-links.mjs --fixture <dir> # 受检面构造测试（跳过下界与哨兵）
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

/** 受检入口文件（存在才检查）。 */
export const ENTRY_FILES = ['AGENTS.md', 'CLAUDE.md']

/** 哨兵文件：必须在受检面内（防「收窄到子目录」静默通过）。 */
export const SENTINELS = ['AGENTS.md', '.github/skills/code-reviewer/SKILL.md']

/** 受检面下界（防静默收窄）。 */
export const SCOPE_FLOOR = { files: 25 }

/**
 * GitHub slug：小写 → 去掉除字母 / 数字 / 空格 / 连字符 / 下划线外的字符 → 空格转连字符。
 * 数字开头标题**不补**前缀（与 VitePress 相反）。
 */
export function githubSlug(heading) {
    return heading
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\p{M} _-]/gu, '')
        .replace(/ +/g, '-')
}

/** 抽取文本中的标题（去掉行尾 `#` 装饰与行内标记）。 */
export function extractHeadings(text) {
    const headings = []
    for (const match of text.matchAll(/^#{1,6}\s+(.+)$/gm)) {
        const raw = match[1].replace(/[#*`]/g, '').trim()
        headings.push(githubSlug(raw))
    }
    return headings
}

/** 去掉围栏代码块与行内 code span（示例链接不参与判定）。 */
export function stripCode(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')
        .replace(/~~~[\s\S]*?~~~/g, '')
        .replace(/`[^`]*`/g, '')
}

/** 抽取 markdown 行内链接的目标（`](target)`）。 */
export function extractLinks(text) {
    return [...text.matchAll(/\]\(([^)\s]+)\)/g)].map((match) => match[1])
}

/**
 * 扫描单个文件，返回问题列表。
 *
 * @param {string} file 绝对路径
 * @param {string} text 文件内容
 * @returns {Array<{ code: string, detail: string }>}
 */
export function scanFile(file, text) {
    const issues = []
    for (const target of extractLinks(stripCode(text))) {
        const [pathPart, anchor] = target.split('#')
        if (!pathPart || /^(https?:|mailto:|#)/.test(target)) {
            continue
        }
        const resolved = resolve(dirname(file), pathPart)
        if (!existsSync(resolved)) {
            issues.push({ code: 'missing-target', detail: `${relative(REPO_ROOT, file)} -> ${target}` })
            continue
        }
        if (!anchor || !pathPart.endsWith('.md')) {
            continue
        }
        const heads = extractHeadings(readFileSync(resolved, 'utf8'))
        if (!heads.includes(decodeURIComponent(anchor))) {
            issues.push({ code: 'bad-anchor', detail: `${relative(REPO_ROOT, file)} -> ${target}` })
        }
    }
    return issues
}

function collectMarkdown(dir, out) {
    for (const name of readdirSync(dir)) {
        const full = join(dir, name)
        if (statSync(full).isDirectory()) {
            collectMarkdown(full, out)
            continue
        }
        if (name.endsWith('.md')) {
            out.push(full)
        }
    }
    return out
}

/** 收集受检文件（入口 + `.github/**` 的 markdown）。 */
export function collectAssetFiles(rootDir) {
    const files = []
    for (const entry of ENTRY_FILES) {
        const full = join(rootDir, entry)
        if (existsSync(full)) {
            files.push(full)
        }
    }
    const githubDir = join(rootDir, '.github')
    if (existsSync(githubDir)) {
        collectMarkdown(githubDir, files)
    }
    return files.sort()
}

/** 扫描全部受检文件。 */
export function scanAssets(rootDir, { enforceScope = true } = {}) {
    const files = collectAssetFiles(rootDir)
    const issues = []
    for (const file of files) {
        for (const issue of scanFile(file, readFileSync(file, 'utf8'))) {
            issues.push({ ...issue, file })
        }
    }
    if (enforceScope) {
        if (files.length < SCOPE_FLOOR.files) {
            issues.push({ code: 'scope-narrowed', detail: `受检文件数 ${files.length} 低于下界 ${SCOPE_FLOOR.files}` })
        }
        for (const sentinel of SENTINELS) {
            if (!files.some((file) => file.endsWith(sentinel))) {
                issues.push({ code: 'sentinel-missing', detail: `哨兵文件不在受检面：${sentinel}` })
            }
        }
    }
    return { files, issues }
}

export function main(argv = process.argv.slice(2)) {
    const fixtureIndex = argv.indexOf('--fixture')
    let rootDir = REPO_ROOT
    let enforceScope = true
    if (fixtureIndex !== -1) {
        const target = argv[fixtureIndex + 1]
        if (!target) {
            console.error('[check-ai-asset-links] --fixture 需要目录参数')
            return 2
        }
        rootDir = resolve(target)
        enforceScope = false
        if (!existsSync(rootDir)) {
            console.error(`[check-ai-asset-links] --fixture 目录不存在：${rootDir}`)
            return 2
        }
        console.warn(`[check-ai-asset-links][warn] 受检面构造模式（跳过下界与哨兵）：${rootDir}——仅限本地测试，禁止接入 CI`)
    } else if (argv.length > 0) {
        console.error(`[check-ai-asset-links] 不支持的参数：${argv.join(' ')}`)
        return 2
    }
    if (!existsSync(join(rootDir, '.github'))) {
        console.error(`[check-ai-asset-links] 目标目录不是仓库根（缺 .github/）：${rootDir}`)
        return 2
    }

    const { files, issues } = scanAssets(rootDir, { enforceScope })
    if (issues.length > 0) {
        for (const issue of issues) {
            console.error(`[check-ai-asset-links][error] ${issue.code}: ${issue.detail}`)
        }
        console.error(`[check-ai-asset-links] ${issues.length} 处问题（受检 ${files.length} 文件）`)
        return 1
    }
    console.info(`[check-ai-asset-links] OK：AI 资产链接与锚点有效（受检 ${files.length} 文件）`)
    return 0
}

if (isDirectExecution(import.meta.url)) {
    process.exitCode = main()
}
