#!/usr/bin/env node

/**
 * check-example-refs：文档站示例引用存在性与示例 SFC 形态守卫。
 *
 * 校验内容：
 * 1. `docs/**\/*.md` 中每个 `<demo vue="<相对路径>" />` 引用的文件必须存在
 *    （vitepress-demo-plugin 在构建期才会因缺失文件失败，本守卫提供快速反馈）；
 * 2. 被引用的示例 `.vue` 形态合法：根 `<template>` 成对闭合，且其内部不得出现
 *    `<style>` / `<script>`（Vue 编译器对模板内的副作用标签会报
 *    `Tags with side effect (<script> and <style>) are ignored in client component templates.`；
 *    该错误只在 `docs:dev` 的按需 transform 抛出，`docs:build` / `typecheck:docs` 均放行，
 *    故须在此拦截）；
 * 3. 受检范围未被静默收窄：受检 md 文件数、示例引用数、受检示例文件数各设下界，
 *    且须覆盖中英组件页前缀。
 *
 * 受检面边界：
 * - 围栏代码块与行内代码内的 `<demo ...>` 形态视为「语法描述」，不参与检查；
 * - 只检查 `vue` 属性的目标存在性，不解析其它属性；reference-style 与裸 HTML 不在面内；
 * - SFC 形态只校验「根 template 内不得有副作用标签」与「根 template 成对」，不做完整 SFC 解析。
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
export const MIN_EXAMPLE_FILES = 300

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
 * 取根 `<template>` 区块的范围（按标签深度配对，兼容 `v-if` 等嵌套 template）。
 *
 * @param {string} source 文件原文
 * @returns {{ start: number, end: number } | null} 未找到或未成对闭合时返回 `null`
 */
export function rootTemplateRange(source) {
    const start = source.search(/<template[\s>]/)
    if (start < 0) {
        return null
    }
    const re = /<\/?template[\s>]/g
    re.lastIndex = start
    let depth = 0
    let match
    while ((match = re.exec(source))) {
        if (match[0].startsWith('</')) {
            depth -= 1
            if (depth === 0) {
                return { start, end: match.index }
            }
        } else {
            depth += 1
        }
    }
    return null
}

/** 去除 HTML 注释（保留换行以维持行号）：文本近似判定的一部分，避免注释内的 `<style>` 被误判 */
export function stripHtmlComments(text) {
    const blank = (match) => match.replace(/[^\n]/g, '')
    return text.replace(/<!--[\s\S]*?-->/g, blank)
}

/**
 * 校验示例 SFC 形态：根 `<template>` 成对闭合，且内部不得出现 `<style>` / `<script>`。
 *
 * Vue 编译器对模板内的副作用标签会报
 * `Tags with side effect (<script> and <style>) are ignored in client component templates.`，
 * 使 `docs:dev` 在按需 transform 时 500，而 `docs:build` / `typecheck:docs` 均放行。
 *
 * **判定面上界（文本近似）**：本函数基于原始文本匹配，非编译器级解析。已剥离 HTML 注释；
 * **属性值字符串不做剥离**，其中的同类文本会按字面命中（已知误报边界，未豁免）；
 * 「仅 render 函数的 SFC」不在识别模型内（文档示例约定为模板式 SFC）。契约见 §13 守卫说明。
 *
 * @param {string} relPath 展示用路径（仓库相对路径）
 * @param {string} rawSource 文件原文
 * @returns {Array<{ type: string, message: string }>}
 */
export function findSfcShapeIssues(relPath, rawSource) {
    const source = stripHtmlComments(rawSource)
    const range = rootTemplateRange(source)
    if (!range) {
        return [{
            type: 'example-sfc-shape',
            message: `${relPath} 未找到成对的根 <template>（文档示例约定为模板式 SFC）`,
        }]
    }
    const body = source.slice(range.start, range.end)
    const nested = body.match(/<(style|script)[\s>]/)
    if (!nested) {
        return []
    }
    const line = source.slice(0, range.start + nested.index).split(/\r?\n/).length
    return [{
        type: 'example-sfc-shape',
        message: `${relPath}:${line} 根 <template> 内出现 <${nested[1]}>：会使 docs:dev 报 side-effect tag 编译错误（<style> / <script> 必须在 <template> 之外）`,
    }]
}

/**
 * 运行守卫。
 *
 * @param {{ root?: string, docs?: string, minFiles?: number, minRefs?: number, minExamples?: number, requiredPrefixes?: string[] }} [options]
 * @returns {{ issues: Array<{ type: string, message: string }>, files: number, refs: number, examples: number, filesList: string[] }}
 */
export function runExampleRefsCheck(options = {}) {
    const root = options.root ?? projectRoot
    const docs = options.docs ?? join(root, 'docs')
    const minFiles = options.minFiles ?? MIN_SCANNED_FILES
    const minRefs = options.minRefs ?? MIN_DEMO_REFS
    const minExamples = options.minExamples ?? MIN_EXAMPLE_FILES
    const requiredPrefixes = options.requiredPrefixes ?? REQUIRED_SCAN_PREFIXES
    const files = collectMarkdownFiles(docs)
    const issues = []
    let refs = 0
    const examples = new Set()

    for (const file of files) {
        const rel = relative(root, file).replaceAll('\\', '/')
        for (const ref of findDemoRefs(file, readFileSync(file, 'utf8'))) {
            refs += 1
            if (!ref.exists) {
                issues.push({
                    type: 'missing-example',
                    message: `${rel}:${ref.line} <demo vue> 引用的示例不存在: ${ref.target}`,
                })
            } else if (ref.resolved.endsWith('.vue')) {
                examples.add(ref.resolved)
            }
        }
    }

    for (const example of [...examples].sort()) {
        const rel = relative(root, example).replaceAll('\\', '/')
        issues.push(...findSfcShapeIssues(rel, readFileSync(example, 'utf8')))
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
    if (examples.size < minExamples) {
        issues.push({
            type: 'scan-scope-narrowed',
            message: `受检示例文件数 ${examples.size} 低于下界 ${minExamples}（示例引用解析可能被静默收窄）`,
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

    return { issues, files: files.length, refs, examples: examples.size, filesList: relFiles }
}

export function main() {
    const { issues, files, refs, examples } = runExampleRefsCheck()

    if (issues.length > 0) {
        console.error(`[check-example-refs] ${issues.length} 个问题:`)
        for (const issue of issues) {
            console.error(`  - [${issue.type}] ${issue.message}`)
        }
        process.exitCode = 1
        return
    }
    console.info(`[check-example-refs] OK：${files} 个 md / ${refs} 处示例引用 / ${examples} 个示例文件均存在且形态合法`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
