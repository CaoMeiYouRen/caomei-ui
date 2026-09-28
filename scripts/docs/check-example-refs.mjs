#!/usr/bin/env node

/**
 * check-example-refs：文档站示例引用存在性守卫。
 *
 * 校验内容：
 * 1. `docs/**\/*.md` 中每个 `<demo vue="<相对路径>" />` 引用的文件必须存在
 *    （vitepress-demo-plugin 在构建期才会因缺失文件失败，本守卫提供快速反馈）；
 * 2. 受检范围未被静默收窄：受检 md 文件数、示例引用数各设下界，且须覆盖中英组件页前缀。
 *
 * 受检面边界：
 * - 围栏代码块与行内代码内的 `<demo ...>` 形态视为「语法描述」，不参与检查；
 * - 只检查 `vue` 属性的目标存在性，不解析其它属性；reference-style 与裸 HTML 不在面内。
 *
 * 用法：
 *   node scripts/docs/check-example-refs.mjs            # 有问题 exit 1
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

export const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
export const docsRoot = join(projectRoot, 'docs')

/** 受检面下界（防扫描器 / 入口配置静默收窄）。 */
export const MIN_SCANNED_FILES = 200
export const MIN_DEMO_REFS = 300

/** 受检面必须覆盖的 docs 相对前缀（中英组件页示例）。 */
export const REQUIRED_SCAN_PREFIXES = ['components/', 'i18n/en-US/components/']

const EXCLUDED_DIRS = new Set(['node_modules', '.git', 'dist', 'cache', 'data', '.vitepress'])
const DEMO_RE = /<demo\b([^>]*?)\/?>/gs
const VUE_ATTR_RE = /vue\s*=\s*"([^"]+)"/

/** 递归收集 docs 下的 Markdown。 */
export function collectMarkdownFiles(root = docsRoot, acc = []) {
    if (!statSync(root, { throwIfNoEntry: false })?.isDirectory()) {
        return acc
    }
    for (const entry of readdirSync(root)) {
        if (EXCLUDED_DIRS.has(entry)) {
            continue
        }
        const full = join(root, entry)
        if (statSync(full).isDirectory()) {
            collectMarkdownFiles(full, acc)
        } else if (entry.endsWith('.md')) {
            acc.push(full)
        }
    }
    return acc
}

/** 去除围栏代码块与行内代码，避免把「语法描述」当真实引用；**保留换行**以维持行号不偏移。 */
export function stripCode(text) {
    const blank = (match) => match.replace(/[^\n]/g, '')
    return text.replace(/```[\s\S]*?```/g, blank).replace(/`[^`]*`/g, blank)
}

/**
 * 提取一份 Markdown 中的 `<demo vue="...">` 引用。
 *
 * @param {string} file 绝对路径
 * @param {string} raw 文件原文
 * @returns {Array<{ line: number, target: string, resolved: string, exists: boolean }>}
 */
export function findDemoRefs(file, raw) {
    const text = stripCode(raw)
    const refs = []
    for (const m of text.matchAll(DEMO_RE)) {
        const vm = m[1].match(VUE_ATTR_RE)
        if (!vm) {
            continue
        }
        const target = vm[1]
        const resolved = resolve(dirname(file), target)
        refs.push({
            line: text.slice(0, m.index).split(/\r?\n/).length,
            target,
            resolved,
            exists: existsSync(resolved),
        })
    }
    return refs
}

/**
 * 运行守卫。
 *
 * @param {{ root?: string, docs?: string, minFiles?: number, minRefs?: number, requiredPrefixes?: string[] }} [options]
 * @returns {{ issues: Array<{ type: string, message: string }>, files: number, refs: number, filesList: string[] }}
 */
export function runExampleRefsCheck(options = {}) {
    const root = options.root ?? projectRoot
    const docs = options.docs ?? join(root, 'docs')
    const minFiles = options.minFiles ?? MIN_SCANNED_FILES
    const minRefs = options.minRefs ?? MIN_DEMO_REFS
    const requiredPrefixes = options.requiredPrefixes ?? REQUIRED_SCAN_PREFIXES
    const files = collectMarkdownFiles(docs)
    const issues = []
    let refs = 0

    for (const file of files) {
        const rel = relative(root, file).replaceAll('\\', '/')
        for (const ref of findDemoRefs(file, readFileSync(file, 'utf8'))) {
            refs += 1
            if (!ref.exists) {
                issues.push({
                    type: 'missing-example',
                    message: `${rel}:${ref.line} <demo vue> 引用的示例不存在: ${ref.target}`,
                })
            }
        }
    }

    if (files.length < minFiles) {
        issues.push({
            type: 'scan-scope-narrowed',
            message: `受检 md 文件数 ${files.length} 低于下界 ${minFiles}（扫描器 / 入口配置可能被静默收窄）`,
        })
    }
    if (refs < minRefs) {
        issues.push({
            type: 'scan-scope-narrowed',
            message: `示例引用数 ${refs} 低于下界 ${minRefs}（提取逻辑可能被静默收窄）`,
        })
    }
    const relFiles = files.map((f) => relative(docs, f).replaceAll('\\', '/'))
    for (const prefix of requiredPrefixes) {
        if (!relFiles.some((f) => f.startsWith(prefix))) {
            issues.push({
                type: 'scan-scope-narrowed',
                message: `受检面缺少前缀 ${prefix}（中英组件页示例未覆盖）`,
            })
        }
    }

    return { issues, files: files.length, refs, filesList: relFiles }
}

export function main() {
    const { issues, files, refs } = runExampleRefsCheck()

    if (issues.length > 0) {
        console.error(`[check-example-refs] ${issues.length} 个问题:`)
        for (const issue of issues) {
            console.error(`  - [${issue.type}] ${issue.message}`)
        }
        process.exitCode = 1
        return
    }
    console.info(`[check-example-refs] OK：${files} 个 md / ${refs} 处示例引用均存在`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
