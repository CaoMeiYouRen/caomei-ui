#!/usr/bin/env node

/**
 * check-links：检查仓库内所有 .md 文件的本地链接。
 *
 * 校验内容：
 * 1. 相对路径链接的目标文件必须存在（兼容 VitePress 省略 .md 的裸路径）；
 * 2. 锚点（#xxx）必须能在目标文件（或当前文件）中找到对应标题——使用宽松规范化，
 *    兼容 GitHub / VS Code / VitePress 的 slug 差异；
 * 3. 拒绝本地绝对路径链接（POSIX `/xxx`、Windows `C:/xxx`）；
 * 4. 拒绝超出仓库根目录的路径穿越；
 * 5. 正文中拒绝个人机器绝对路径（`C:\...`、UNC `\\server`）。
 *
 * 用法：node scripts/docs/check-links.mjs
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')

export const EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.nuxt',
    '.output',
    '.cache',
    'dist',
    'coverage',
    'logs',
    'tmp',
    'artifacts',
    '.claude',
    '.agents',
    '.opencode',
    '.vitepress',
    'playwright-report',
    'test-results',
    '.vscode',
    '.session',
])

export const IGNORED_FILES = new Set(['CHANGELOG.md'])

const LINK_RE = /\[([^\]]*)\]\(([^)]+)\)/g
const ABS_PATH_RE = /^(?:[a-zA-Z]:[\\/]|\\\\|\/)/
const BODY_ABS_PATH_RE = /(?<![a-zA-Z])(?:[a-zA-Z]:[\\/][^\s`)'"，。；：！？、`]+|\\\\[A-Za-z0-9][^\s`)'"，。；：！？、`]+)/g
const GITHUB_LINE_ANCHOR_RE = /^L\d+$/

export function walk(root, out = []) {
    for (const entry of readdirSync(root)) {
        if (EXCLUDED_DIRS.has(entry)) {
            continue
        }
        const full = join(root, entry)
        const st = statSync(full)
        if (st.isDirectory()) {
            walk(full, out)
        } else if (entry.endsWith('.md') && !IGNORED_FILES.has(entry)) {
            out.push(full)
        }
    }
    return out
}

export function looseNorm(str) {
    return str.toLowerCase().replace(/[\p{P}\p{S}\s]+/gu, '')
}

export function collectTitles(file) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    const titles = new Set()
    let inCode = false
    for (const line of lines) {
        if (/^\s*```/.test(line)) {
            inCode = !inCode
            continue
        }
        if (inCode) {
            continue
        }
        const m = line.match(/^(#{1,6})\s+(.+)$/)
        if (!m) {
            continue
        }
        const title = m[2]
            .replace(/`[^`]*`/g, '')
            .replace(/\[[^\]]*\]\([^)]*\)/g, '')
            .replace(/[#*_~]/g, '')
            .trim()
        titles.add(looseNorm(title))
    }
    return titles
}

export function normAnchor(anchor) {
    try {
        return looseNorm(decodeURIComponent(anchor))
    } catch {
        return looseNorm(anchor)
    }
}

export function isLineAnchor(anchor) {
    return GITHUB_LINE_ANCHOR_RE.test(anchor)
}

export function collectMdFiles(root = projectRoot) {
    return walk(root)
}

export function checkFile(file, root = projectRoot) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    const selfTitles = collectTitles(file)
    const docsRoot = join(root, 'docs')
    const isUnderDocs = !relative(docsRoot, file).startsWith('..')
    const errors = []
    const rel = relative(root, file).replaceAll('\\', '/')
    let inCode = false

    lines.forEach((line, idx) => {
        if (/^\s*```/.test(line)) {
            inCode = !inCode
            return
        }
        if (inCode) {
            return
        }
        const clean = line.replace(/`[^`]*`/g, '')
        for (const m of clean.matchAll(LINK_RE)) {
            const target = m[2]
            if (!target || /^(https?:|mailto:|tel:|www\.|<)/.test(target)) {
                continue
            }
            const [pathPart, anchor] = target.split('#')

            if (!pathPart) {
                if (anchor && !selfTitles.has(normAnchor(anchor))) {
                    errors.push(`${rel}:${idx + 1} 站内锚点 "#${anchor}" 在文件中找不到对应标题`)
                }
                continue
            }

            // VitePress 站点根路径（/guide/xxx）：仅 docs/ 下的文件允许，按 docs 根解析
            const isSiteRootLink = pathPart.startsWith('/')
                && !pathPart.startsWith('//')
                && !/^[a-zA-Z]:/.test(pathPart)
            if (isSiteRootLink) {
                if (!isUnderDocs) {
                    errors.push(`${rel}:${idx + 1} docs/ 之外的 Markdown 不允许使用站点根路径链接: ${pathPart}`)
                    continue
                }
                const sitePath = pathPart.replace(/^\//, '')
                const candidates = [
                    join(docsRoot, sitePath),
                    join(docsRoot, `${sitePath}.md`),
                    join(docsRoot, sitePath, 'index.md'),
                ]
                const siteTarget = candidates.find((c) => existsSync(c))
                if (!siteTarget) {
                    errors.push(`${rel}:${idx + 1} 站点链接目标不存在: ${pathPart}`)
                    continue
                }
                if (anchor && !isLineAnchor(anchor) && !collectTitles(siteTarget).has(normAnchor(anchor))) {
                    errors.push(`${rel}:${idx + 1} 锚点 "#${anchor}" 在 ${pathPart} 中找不到对应标题`)
                }
                continue
            }

            if (ABS_PATH_RE.test(pathPart)) {
                errors.push(`${rel}:${idx + 1} 链接目标为本地绝对路径，应使用相对路径: ${pathPart}`)
                continue
            }

            const targetFile = resolve(dirname(file), pathPart)
            const relTarget = relative(root, targetFile)
            const sep = relTarget.includes('\\') ? '\\' : '/'
            if (relTarget === '..' || relTarget.startsWith(`..${sep}`) || isAbsolute(relTarget)) {
                errors.push(`${rel}:${idx + 1} 链接目标超出项目范围（路径穿越）: ${pathPart}`)
                continue
            }

            let resolvedTarget = targetFile
            if (!existsSync(targetFile) && !pathPart.endsWith('.md')) {
                const targetWithMd = resolve(dirname(file), `${pathPart}.md`)
                if (existsSync(targetWithMd)) {
                    resolvedTarget = targetWithMd
                }
            }

            if (!existsSync(resolvedTarget)) {
                errors.push(`${rel}:${idx + 1} 链接目标不存在: ${pathPart}`)
                continue
            }
            if (anchor && !isLineAnchor(anchor)) {
                const titles = collectTitles(resolvedTarget)
                if (!titles.has(normAnchor(anchor))) {
                    errors.push(`${rel}:${idx + 1} 锚点 "#${anchor}" 在 ${pathPart} 中找不到对应标题`)
                }
            }
        }

        const linkless = line.replace(LINK_RE, '')
        for (const m of linkless.matchAll(BODY_ABS_PATH_RE)) {
            errors.push(`${rel}:${idx + 1} 正文包含本地绝对路径（个人机器路径），应使用项目相对路径或占位符: ${m[0]}`)
        }
    })
    return errors
}

export function runCheckLinks(options = {}) {
    const root = options.root ?? projectRoot
    const files = options.files ?? collectMdFiles(root)
    const errors = []
    for (const file of files) {
        errors.push(...checkFile(file, root))
    }
    return { errors, files }
}

export function main() {
    const { errors, files } = runCheckLinks()

    if (errors.length > 0) {
        console.error(`[docs-check-links] ${errors.length} 个链接问题:`)
        for (const error of errors) {
            console.error(`  - ${error}`)
        }
        process.exitCode = 1
        return
    }
    console.info(`[docs-check-links] OK：${files.length} 个 md 文件的本地链接全部有效`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
