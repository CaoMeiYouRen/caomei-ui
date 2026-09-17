#!/usr/bin/env node

/**
 * check-design：设计规范可验证脚本。
 *
 * 检查项：
 * 1. token 引用存在性：`var(--caomei-*)` 若既非全局 token（`src/styles/**`）、也非同文件局部定义、又无 fallback，视为错误；
 * 2. 组件原始色值：`src/components/**` 的样式块出现 `#hex` 为错误；`rgb()/rgba()/hsl()` 受预算约束（超出预算为错误）；
 * 3. 档位常量：`src/types.ts` 的 `ComponentSize` / `ComponentVariant` / `ComponentTone` 必须与设计规范一致；
 * 4. 旧命名泄漏：组件类型中的 `'small'` / `'large'` 尺寸命名为错误。
 *
 * 用法：
 *   node scripts/governance/check-design.mjs            # 有错误 exit 1
 *   node scripts/governance/check-design.mjs --strict   # 警告也被视为错误
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isDirectExecution } from '../shared/cli.mjs'

const REPO_ROOT = join(fileURLToPath(import.meta.url), '..', '..', '..')
const SRC = join(REPO_ROOT, 'src')
const STYLES = join(SRC, 'styles')
const COMPONENTS = join(SRC, 'components')
const TYPES_FILE = join(SRC, 'types.ts')

/** 已知遗留的原始 rgb/hsl 字面量预算：0 = 预算覆盖的原始色值字面量已清零（`color-mix()` 组合不在其扫描面），任何原始色值即回归。 */
export const RGB_BUDGET = 0

const EXPECTED_UNIONS = {
    ComponentSize: ['sm', 'md', 'lg'],
    ComponentVariant: ['primary', 'secondary', 'ghost'],
    ComponentTone: ['neutral', 'primary', 'success', 'warning', 'danger'],
}

/** 递归收集文件。 */
function walk(dir, filter, acc = []) {
    if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) {
        return acc
    }
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name === 'node_modules' || entry.name === 'dist') {
            continue
        }
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
            walk(full, filter, acc)
        } else if (filter(full)) {
            acc.push(full)
        }
    }
    return acc
}

const rel = (file) => relative(REPO_ROOT, file).split('\\').join('/')

/** 提取文件的可扫描样式内容：`.vue` 只取 `<style>` 块，`.css` 取全文。 */
export function extractStyleText(file, text) {
    if (!file.endsWith('.vue')) {
        return text
    }
    const blocks = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    return blocks.map((m) => m[1]).join('\n')
}

/** 提取样式块及其内容起始行（用于准确报行号）。 */
export function extractStyleBlocks(file, text) {
    if (!file.endsWith('.vue')) {
        return [{ text, startLine: 1 }]
    }
    const blocks = []
    const re = /<style[^>]*>([\s\S]*?)<\/style>/g
    let m
    while ((m = re.exec(text)) !== null) {
        const contentStart = m.index + m[0].indexOf('>') + 1
        const startLine = text.slice(0, contentStart).split(/\r?\n/).length
        blocks.push({ text: m[1], startLine })
    }
    return blocks
}

/** 由 `src/**` 读取待检查条目。 */
function collectEntries(dir, filter) {
    return walk(dir, filter).map((file) => ({ file, text: readFileSync(file, 'utf8') }))
}

/** 收集全局 token（`src/styles` 下的 CSS 定义）。 */
export function collectGlobalTokens() {
    const defined = new Set()
    for (const file of walk(STYLES, (f) => f.endsWith('.css'))) {
        const text = readFileSync(file, 'utf8')
        for (const m of text.matchAll(/(--caomei-[a-z0-9-]+)\s*:/g)) {
            defined.add(m[1])
        }
    }
    return defined
}

/** 收集某文件内局部定义的 token（样式块内 `--caomei-*:`）。 */
export function collectLocalTokens(text) {
    const defined = new Set()
    for (const m of extractStyleText('x.vue', text).matchAll(/(--caomei-[a-z0-9-]+)\s*:/g)) {
        defined.add(m[1])
    }
    return defined
}

/** 检查条目中的 `var(--caomei-*)` 引用是否可解析。 */
export function findTokenIssues(entries, globalTokens) {
    const issues = []
    for (const { file, text } of entries) {
        const style = extractStyleText(file, text)
        const allowed = new Set([...globalTokens, ...collectLocalTokens(text)])
        for (const m of style.matchAll(/var\(\s*(--caomei-[a-z0-9-]+)\s*([,)])/g)) {
            const [, name, next] = m
            if (allowed.has(name) || next === ',') {
                continue
            }
            issues.push({ file: rel(file), name })
        }
    }
    return issues
}

/** 检查条目样式块内的原始色值。 */
export function findRawColors(entries) {
    const errors = []
    const warnings = []
    for (const { file, text } of entries) {
        for (const block of extractStyleBlocks(file, text)) {
            block.text.split(/\r?\n/).forEach((line, idx) => {
                const lineNo = block.startLine + idx
                if (/#[0-9a-fA-F]{3,8}\b/.test(line)) {
                    errors.push({ file: rel(file), line: lineNo, text: line.trim() })
                }
                if (/\b(rgb|rgba|hsl|hsla)\(/.test(line)) {
                    warnings.push({ file: rel(file), line: lineNo, text: line.trim() })
                }
            })
        }
    }
    return { errors, warnings }
}

/** 解析档位联合类型；支持多行 `|` 写法。 */
export function parseTypeScale(text, name) {
    const m = new RegExp(`export type ${name}\\s*=\\s*([\\s\\S]*?)(?:\\n\\n|\\nexport|$)`).exec(text)
    if (!m) {
        return null
    }
    return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1])
}

/** 检查档位常量与设计规范一致。 */
export function findTypeScaleIssues(text, expected = EXPECTED_UNIONS) {
    const issues = []
    for (const [name, values] of Object.entries(expected)) {
        const actual = parseTypeScale(text, name)
        if (actual === null) {
            issues.push(`${name} 未在 src/types.ts 中定义`)
            continue
        }
        if (actual.length !== values.length || actual.some((v, i) => v !== values[i])) {
            issues.push(`${name} 期望 ${values.join(' | ')}，实际 ${actual.join(' | ')}`)
        }
    }
    return issues
}

/** 检查 PrimeVue 旧尺寸命名泄漏。 */
export function findLegacyNaming(entries) {
    const files = []
    for (const { file, text } of entries) {
        if (/'small'|'large'/.test(text)) {
            files.push(rel(file))
        }
    }
    return files
}

/** 汇总所有检查结果。 */
export function runChecks() {
    const componentEntries = collectEntries(COMPONENTS, (f) => /\.(css|vue)$/.test(f))
    const sourceEntries = collectEntries(SRC, (f) => /\.(css|vue)$/.test(f) && !/\.test\./.test(f))
    const typeEntries = collectEntries(COMPONENTS, (f) => f.endsWith('.ts') && !/\.test\./.test(f))
    return {
        tokenIssues: findTokenIssues(sourceEntries, collectGlobalTokens()),
        rawColors: findRawColors(componentEntries),
        typeIssues: findTypeScaleIssues(readFileSync(TYPES_FILE, 'utf8')),
        legacyNaming: findLegacyNaming(typeEntries),
    }
}

function main() {
    const strict = process.argv.includes('--strict')
    const result = runChecks()
    const problems = []
    const notes = []

    for (const issue of result.tokenIssues) {
        problems.push(`[token] ${issue.file}: 引用未定义且无 fallback 的 ${issue.name}`)
    }
    for (const issue of result.rawColors.errors) {
        problems.push(`[color] ${issue.file}:${issue.line}: 组件内出现原始 hex 色值：${issue.text}`)
    }
    for (const issue of result.typeIssues) {
        problems.push(`[scale] src/types.ts: ${issue}`)
    }
    for (const file of result.legacyNaming) {
        problems.push(`[naming] ${file}: 出现 PrimeVue 旧尺寸命名 'small' / 'large'`)
    }
    for (const issue of result.rawColors.warnings) {
        notes.push(`[color:warn] ${issue.file}:${issue.line}: 组件内原始 rgb/hsl 字面量（预算 ${RGB_BUDGET} 处，超出即失败）：${issue.text}`)
    }

    notes.forEach((line) => console.warn(line))

    if (result.rawColors.warnings.length > RGB_BUDGET) {
        problems.push(`[color] 原始 rgb/hsl 字面量 ${result.rawColors.warnings.length} 处，超出预算 ${RGB_BUDGET} 处（新增需 token 化，或按规范调整预算）`)
    }

    if (problems.length > 0) {
        problems.forEach((line) => console.error(line))
        console.error(`[check-design] 失败：${problems.length} 处错误`)
        process.exit(1)
    }

    if (strict && notes.length > 0) {
        console.error(`[check-design] --strict 下 ${notes.length} 处警告视为失败`)
        process.exit(1)
    }

    console.info(`[check-design] 通过：token 引用有效、无原始 hex 色值、档位常量一致（rgb 警告 ${notes.length}/${RGB_BUDGET} 处）`)
}

if (isDirectExecution(import.meta.url)) {
    main()
}
