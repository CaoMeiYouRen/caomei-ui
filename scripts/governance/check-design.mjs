#!/usr/bin/env node

/**
 * check-design：设计规范可验证脚本。
 *
 * 检查项：
 * 1. token 引用存在性：`var(--caomei-*)` 若既非全局 token（`src/styles/**`）、也非同文件局部定义、又无 fallback，视为错误；
 * 2. 组件原始色值：`src/components/**` 的样式块出现 `#hex` 为错误；`rgb()/rgba()/hsl()` 受预算约束（超出预算为错误）；
 * 3. 档位常量：`src/types.ts` 的 `ComponentSize` / `ComponentVariant` / `ComponentTone` 必须与设计规范一致；
 * 4. 旧命名泄漏：组件类型中的 `'small'` / `'large'` 尺寸命名、以及组件样式选择器中的 `--small` / `--large` 为错误；
 * 5. 档位块直接声明属性（G1）：`:where(.caomei-<comp>[__<el>]--<档位/变体>)` 规则内出现非自定义属性为错误；
 * 6. scoped 变量声明（G2）：组件样式块内声明**非全局 token** 的 `--caomei-*` 时选择器必须含 `:where(`（基类不预声明默认值）；
 * 7. 禁用态字面量（G3）：`opacity: 0.5 / 0.6` 字面量为错误（跳过 `@keyframes` 块）；
 * 8. 层级字面量（G4）：数字 `z-index` 为错误，必须走 `var(--caomei-z-*)` 或关键字；
 * 9. 尺寸档位选择器归一（G5）：`.caomei-<comp>[__<el>]--(sm|md|lg)` 未被 `:where(...)` 包裹为错误
 *    （G1 / G2 只检查「已用 `:where()`」的块，本项拦的是「根本没用 `:where()`」的形态）；
 * 10. 同规则内同名属性重复声明（G6）：后写覆盖先写、前者恒为死代码，为错误
 *    （含自定义属性；本项目组件样式层已统一依赖 `color-mix()`，故不保留渐进增强回退分支）。
 * 11. 受检面下界：组件样式规则数低于下界（扫描器 / 入口配置静默收窄）为错误。
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

/** 禁用态 `opacity` 字面量预算（G3）：0 = 禁用态一律走 `--caomei-disabled-opacity`。 */
export const OPACITY_BUDGET = 0

/** 数字 `z-index` 预算（G4）：0 = 一律走 `var(--caomei-z-*)`。 */
export const Z_INDEX_BUDGET = 0

/**
 * 档位 / 变体选择器允许的修饰符集合（G1 的规则面）：
 * 取 `src/types.ts` 的受控枚举——尺寸 `sm|md|lg`、变体 `primary|secondary|ghost`、语气 `neutral|primary|success|warning|danger`。
 * 组件自有的结构型修饰符（如 `circular` / `vertical` / `striped` / `hoverable` / `padding-*`）不在此列，
 * 属「低特异性布局覆盖」而非档位变量块，故不纳入 G1（依据见 docs/design/governance/2026-09-20-m2-1-component-quality-audit.md §3.5）。
 */
const NON_CUSTOM_MODIFIERS = [
    'sm', 'md', 'lg',
    'primary', 'secondary', 'ghost',
    'neutral', 'success', 'warning', 'danger',
].join('|')

/** 匹配 `:where(.caomei-<comp>[__<el>]--<档位/变体>)` 开头的规则。 */
const TIER_BLOCK_RE = new RegExp(
    `^:where\\(\\s*\\.caomei-[a-z0-9-]+(?:__[a-z0-9-]+)?--(?:${NON_CUSTOM_MODIFIERS})\\s*\\)`,
)

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

/** 检查 PrimeVue 旧尺寸命名泄漏（组件类型中的 `'small'` / `'large'` 字面量）。 */
export function findLegacyNaming(entries) {
    const files = []
    for (const { file, text } of entries) {
        if (/'small'|'large'/.test(text)) {
            files.push(rel(file))
        }
    }
    return files
}

/**
 * 旧尺寸命名在**样式选择器**中的形态：`--small` / `--large` 修饰符（当前尺寸档位为 `sm` / `md` / `lg`）。
 * 与 `findLegacyNaming` 同属「旧命名泄漏」面，但扫描对象是组件样式块的选择器，而非 TS 字面量。
 *
 * 规则面边界（有意）：`-` 属词边界字符，`--small\b` 亦会命中 `--small-font` 一类复合尾串；
 * 裸类 `.x-small`（无修饰符）不在面内。两者现网均零命中，需要时另行评估扩面。
 */
const LEGACY_SIZE_SELECTOR_RE = /--(small|large)\b/

/** 检查组件样式选择器中的旧尺寸命名（`--small` / `--large`）。 */
export function findLegacySizeSelectors(entries) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        if (LEGACY_SIZE_SELECTOR_RE.test(rule.selector)) {
            issues.push({ file: rule.file, selector: rule.selector })
        }
    }
    return issues
}

/**
 * 受检面下界（**规则面**）：组件样式规则数不得低于该值。扫描器（`collectRuleEntries` /
 * `scanRules` / `extractStyleBlocks`）或入口配置静默收窄时，全部规则面守卫会「空转通过」——
 * 本断言把这种退化直接判失败。
 *
 * 下界取当前实测规模的七成余量（拦截「整体失效」与「整目录被跳过」类部分收窄）；**组件下线**
 * 导致规则数合法下降时，按规范同步下调下界（消息已提示该路径）。
 */
export const MIN_COMPONENT_RULE_COUNT = 600

/**
 * 受检面下界（**声明面**）：组件样式的声明总数不得低于该值。规则数下界挡不住「规则仍在、
 * 声明解析静默丢项」——声明面下界让 `declarationsOf` 的解析收窄可被回归断言捕获。
 */
export const MIN_COMPONENT_DECLARATION_COUNT = 2500

/** 组件样式受检面规模（规则数 / 声明数），供下界断言与运行摘要复用（单次扫描）。 */
export function countComponentScanScope(entries) {
    const rules = collectRuleEntries(entries)
    const declarationCount = rules.reduce((total, rule) => total + declarationsOf(rule.body).length, 0)
    return { ruleCount: rules.length, declarationCount }
}

/**
 * 检查受检面是否被静默收窄（规则数 / 声明数低于各自下界）。
 * `counts` 可由调用方预计算复用，避免同一受检面被重复全量扫描。
 */
export function findScanScopeIssues(entries, counts = countComponentScanScope(entries)) {
    const { ruleCount, declarationCount } = counts
    const issues = []
    if (ruleCount < MIN_COMPONENT_RULE_COUNT) {
        issues.push({ kind: 'rule', actual: ruleCount, floor: MIN_COMPONENT_RULE_COUNT })
    }
    if (declarationCount < MIN_COMPONENT_DECLARATION_COUNT) {
        issues.push({ kind: 'declaration', actual: declarationCount, floor: MIN_COMPONENT_DECLARATION_COUNT })
    }
    return issues
}

/** 跳过空白与注释。 */
function skipTrivia(text, i) {
    while (i < text.length) {
        if (/\s/.test(text[i])) {
            i += 1
            continue
        }
        if (text[i] === '/' && text[i + 1] === '*') {
            const end = text.indexOf('*/', i + 2)
            i = end === -1 ? text.length : end + 2
            continue
        }
        break
    }
    return i
}

/**
 * 从 `i` 起查找下一个**顶层定界符**（`{` / `;` / `}`），途中跳过注释与字符串字面量。
 * 用于区分「带块规则」（`{` 先到）与「语句型 at-rule」（`;` 先到，如 `@import` / `@charset` / `@use`）。
 */
function nextDelimiter(text, i) {
    while (i < text.length) {
        const ch = text[i]
        if (ch === '/' && text[i + 1] === '*') {
            const end = text.indexOf('*/', i + 2)
            i = end === -1 ? text.length : end + 2
            continue
        }
        if (ch === '"' || ch === '\'') {
            const quote = ch
            i += 1
            while (i < text.length && text[i] !== quote) {
                i += text[i] === '\\' ? 2 : 1
            }
            i += 1
            continue
        }
        if (ch === '{' || ch === ';' || ch === '}') {
            return { index: i, char: ch }
        }
        i += 1
    }
    return { index: -1, char: null }
}

/**
 * 扫描 CSS 文本为声明规则列表（递归展开 `@media` / `@supports` / `@layer` / `@container`，
 * 标记 `@keyframes` 内部块）。返回 `{ selector, body, inKeyframes }`。
 *
 * 语句型 at-rule（`@import "x.css";` / `@charset "utf-8";` / `@use ...;` 等无块形式）以 `;` 切分并跳过，
 * 避免「下一个 `{`」把后续规则并入 prelude 而整条吞掉。
 */
export function scanRules(text, inKeyframes = false, acc = []) {
    let i = 0
    const length = text.length
    while (i < length) {
        i = skipTrivia(text, i)
        if (i >= length) {
            break
        }
        const delimiter = nextDelimiter(text, i)
        if (delimiter.index === -1) {
            break
        }
        if (delimiter.char === ';' || delimiter.char === '}') {
            // 语句型 at-rule / 游离分隔符：跳过，不吞掉后续规则
            i = delimiter.index + 1
            continue
        }
        const brace = delimiter.index
        const prelude = text.slice(i, brace).trim()
        let depth = 1
        let j = brace + 1
        while (j < length && depth > 0) {
            const ch = text[j]
            // 与 nextDelimiter 同口径：跳过注释与字符串字面量，避免 `content: "}"` 或注释里的
            // 花括号提前结束配平（那会把后续规则并入本块而静默漏检）。
            if (ch === '/' && text[j + 1] === '*') {
                const end = text.indexOf('*/', j + 2)
                j = end === -1 ? length : end + 2
                continue
            }
            if (ch === '"' || ch === '\'') {
                const quote = ch
                j += 1
                while (j < length && text[j] !== quote) {
                    j += text[j] === '\\' ? 2 : 1
                }
                j += 1
                continue
            }
            if (ch === '{') {
                depth += 1
            } else if (ch === '}') {
                depth -= 1
            }
            j += 1
        }
        const body = text.slice(brace + 1, j - 1)
        if (prelude.startsWith('@')) {
            const at = prelude.slice(1).split(/[\s(]/, 1)[0].toLowerCase()
            if (at === 'keyframes' || at === '-webkit-keyframes') {
                scanRules(body, true, acc)
            } else if (['media', 'supports', 'layer', 'container', 'scope', 'starting-style', 'page', 'property'].includes(at)) {
                scanRules(body, inKeyframes, acc)
            }
        } else if (prelude.length > 0) {
            acc.push({ selector: prelude, body, inKeyframes })
        }
        i = j
    }
    return acc
}

/**
 * CSS 属性名形态：自定义属性（`--x`，**大小写敏感**）与标准属性 ident（大小写不敏感，
 * 统一小写后比较——CSS 属性名本身不区分大小写）。
 */
const CUSTOM_PROPERTY_RE = /^--[A-Za-z0-9_-]+$/
const STANDARD_PROPERTY_RE = /^-?[A-Za-z][A-Za-z0-9-]*$/

/**
 * 将规则体解析为声明列表（剥离注释，按首个冒号切分）。
 *
 * 健壮性口径：**只把匹配属性名形态的片段计为声明**——值内分号（如 `content: "a;b"`）切出的
 * 尾段（`b"`）与嵌套规则体不具属性名形态，直接丢弃，避免污染声明面造成假命中；非自定义属性名
 * 统一 `toLowerCase()` 后比较（CSS 属性名不区分大小写），自定义属性名保持原样（大小写敏感）。
 */
export function declarationsOf(body) {
    const withoutComments = body.replace(/\/\*[\s\S]*?\*\//g, '')
    const declarations = []
    for (const raw of withoutComments.split(';')) {
        const item = raw.trim()
        if (!item) {
            continue
        }
        const colon = item.indexOf(':')
        if (colon === -1) {
            continue
        }
        const rawProperty = item.slice(0, colon).trim()
        const isCustomProperty = CUSTOM_PROPERTY_RE.test(rawProperty)
        if (!isCustomProperty && !STANDARD_PROPERTY_RE.test(rawProperty)) {
            continue
        }
        declarations.push({
            property: isCustomProperty ? rawProperty : rawProperty.toLowerCase(),
            value: item.slice(colon + 1).trim(),
        })
    }
    return declarations
}

/** 遍历组件样式块的规则（用于 G1~G4）。 */
function collectRuleEntries(entries) {
    const rules = []
    for (const { file, text } of entries) {
        for (const block of extractStyleBlocks(file, text)) {
            for (const rule of scanRules(block.text)) {
                rules.push({ file: rel(file), ...rule })
            }
        }
    }
    return rules
}

/**
 * G1：档位 / 变体块内不得直接声明属性。
 * 规则面：首个复合选择器为 `:where(.caomei-<comp>[__<el>]--<受控枚举修饰符>)` 的规则；
 * 应只声明 CSS 变量（基类以 `var(--x, fallback)` 消费）。
 */
export function findTierBlockPropertyDeclarations(entries) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        if (!TIER_BLOCK_RE.test(rule.selector.trim())) {
            continue
        }
        for (const decl of declarationsOf(rule.body)) {
            if (!decl.property.startsWith('--')) {
                issues.push({ file: rule.file, selector: rule.selector, property: decl.property, value: decl.value })
            }
        }
    }
    return issues
}

/**
 * G2：组件样式块内声明 `--caomei-*` 时选择器必须含 `:where(`。
 * 排除全局 token 层（`src/styles/**`，如 confirm-dialog 覆写 `--caomei-color-*`）与跨组件传参
 * （如 paginator 传 `--caomei-select-max-width`，其名在全局 token 层），二者均非组件自身命名空间。
 */
export function findScopedVariableDeclarations(entries, globalTokens) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        if (rule.selector.includes(':where(')) {
            continue
        }
        for (const decl of declarationsOf(rule.body)) {
            if (!/^--caomei-[a-z0-9-]+$/.test(decl.property) || globalTokens.has(decl.property)) {
                continue
            }
            issues.push({ file: rule.file, selector: rule.selector, property: decl.property })
        }
    }
    return issues
}

/**
 * G5：尺寸档位选择器必须 `:where()` 归一（预算 0）。
 * 规则面：选择器中的 `.caomei-<comp>[__<el>]--(sm|md|lg)` 出现点，其前方须紧邻 `:where(`（允许空白）。
 * 依据：以 `^:where(` 为规则面的档位块属性守卫与只覆盖变量声明的 scoped 变量守卫，
 * 都无法拦截「档位类直接作为选择器主体」的形态（该形态在归一化收敛前累计 28 条 / 8 组件）。
 * 规范与收敛记录见 docs/standards/development.md §7、
 * docs/design/governance/2026-09-21-m3-1-size-tier-normalization.md。
 * 允许形态：`:where(.x--sm)`、`:where(.x--sm, .y--md)`、`.x--dot:where(.x--lg)`（结构修饰符保持常规特异性）、
 * `:where(:not(.x--sm))`（任一外层括号为 `:where(` 即视为已归零）。
 */
export function findNonWhereSizeSelectors(entries) {
    const issues = []
    const SIZE_CLASS_RE = /\.caomei-[a-z0-9-]+(?:__[a-z0-9-]+)?--(?:sm|md|lg)(?![a-z0-9-])/g
    for (const rule of collectRuleEntries(entries)) {
        // 属性选择器的取值可能含 `where(` 或类名形态，先剥离引号内容再分析
        const selector = rule.selector.replace(/"[^"]*"|'[^']*'/g, '""')
        for (const m of selector.matchAll(SIZE_CLASS_RE)) {
            if (!isWrappedInWhere(selector, m.index)) {
                issues.push({ file: rule.file, selector: rule.selector, className: m[0] })
            }
        }
    }
    return issues
}

/**
 * 判断 `selector[index]` 处的类名是否被 `:where(...)` 归零——沿括号祖先链上溯，
 * 只要任一层包围括号是 `:where(` 即视为已归零（故 `:where(:not(.x--sm))` 与 `:not(:where(.x--sm))` 均放行，
 * 而裸 `:not(.x--sm)` 命中）。
 */
function isWrappedInWhere(selector, index) {
    let depth = 0
    for (let i = index - 1; i >= 0; i--) {
        const ch = selector[i]
        if (ch === ')') {
            depth++
            continue
        }
        if (ch !== '(') {
            continue
        }
        if (depth > 0) {
            depth--
            continue
        }
        const name = selector.slice(0, i).match(/([a-z-]+)$/)
        if (name === null) {
            return false
        }
        if (name[1].toLowerCase() === 'where') {
            return true
        }
    }
    return false
}

/**
 * G6：同规则内同名属性重复声明（死声明，预算 0）。
 * 后写覆盖先写，先写者恒为死代码（调色 / 改值时易误改被覆盖的那条）；覆盖自定义属性。
 * 「先写安全值、后写 color-mix()」不构成回退：后写声明含 `var()` 时不会被解析期丢弃，
 * 而是级联选中后在计算值期非法 → `unset`（invalid at computed-value time），先写值在任何引擎都不生效。
 * 规则面为平铺规则（scanRules 不展开 CSS 嵌套内部），依据见 docs/standards/development.md §7。
 */
export function findDuplicateDeclarations(entries) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        const seen = new Map()
        for (const decl of declarationsOf(rule.body)) {
            if (seen.has(decl.property)) {
                issues.push({
                    file: rule.file,
                    selector: rule.selector,
                    property: decl.property,
                    previous: seen.get(decl.property),
                    value: decl.value,
                })
            }
            seen.set(decl.property, decl.value)
        }
    }
    return issues
}

/** G3：禁用态 `opacity` 字面量（0.5 / 0.6），跳过 `@keyframes` 块。 */
export function findOpacityLiterals(entries) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        if (rule.inKeyframes) {
            continue
        }
        for (const decl of declarationsOf(rule.body)) {
            if (decl.property !== 'opacity') {
                continue
            }
            const value = decl.value.replace(/!important$/i, '').trim()
            const numeric = Number(value)
            if (value !== '' && Number.isFinite(numeric) && (numeric === 0.5 || numeric === 0.6)) {
                issues.push({ file: rule.file, selector: rule.selector, value: decl.value })
            }
        }
    }
    return issues
}

/** G4：数字 `z-index` 字面量；允许 `var(--caomei-z-*)`（含 `calc()` 包装）与关键字。 */
export function findZIndexLiterals(entries) {
    const issues = []
    for (const rule of collectRuleEntries(entries)) {
        for (const decl of declarationsOf(rule.body)) {
            if (decl.property !== 'z-index') {
                continue
            }
            const value = decl.value.replace(/!important$/i, '').trim()
            if (/^-?\d+(?:\.\d+)?$/.test(value)) {
                issues.push({ file: rule.file, selector: rule.selector, value: decl.value })
            }
        }
    }
    return issues
}

/** 汇总所有检查结果。 */
export function runChecks() {
    const componentEntries = collectEntries(COMPONENTS, (f) => /\.(css|vue)$/.test(f))
    const sourceEntries = collectEntries(SRC, (f) => /\.(css|vue)$/.test(f) && !/\.test\./.test(f))
    const typeEntries = collectEntries(COMPONENTS, (f) => f.endsWith('.ts') && !/\.test\./.test(f))
    const globalTokens = collectGlobalTokens()
    // 受检面规模单次计算后复用（下界断言与运行摘要同源，避免重复全量扫描）
    const scanScopeCount = countComponentScanScope(componentEntries)
    return {
        tokenIssues: findTokenIssues(sourceEntries, globalTokens),
        rawColors: findRawColors(componentEntries),
        typeIssues: findTypeScaleIssues(readFileSync(TYPES_FILE, 'utf8')),
        legacyNaming: findLegacyNaming(typeEntries),
        legacySizeSelectors: findLegacySizeSelectors(componentEntries),
        scanScopeCount,
        scanScope: findScanScopeIssues(componentEntries, scanScopeCount),
        tierBlockDeclarations: findTierBlockPropertyDeclarations(componentEntries),
        scopedVariableDeclarations: findScopedVariableDeclarations(componentEntries, globalTokens),
        nonWhereSizeSelectors: findNonWhereSizeSelectors(componentEntries),
        duplicateDeclarations: findDuplicateDeclarations(componentEntries),
        opacityLiterals: findOpacityLiterals(componentEntries),
        zIndexLiterals: findZIndexLiterals(componentEntries),
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
    for (const issue of result.legacySizeSelectors) {
        problems.push(`[naming] ${issue.file}: 样式选择器 ${issue.selector} 出现 PrimeVue 旧尺寸命名（--small / --large，当前档位为 sm / md / lg）`)
    }
    for (const issue of result.scanScope) {
        problems.push(`[scope-floor] 受检面疑似静默收窄：组件样式${issue.kind === 'rule' ? '规则' : '声明'}数 ${issue.actual} 低于下界 ${issue.floor}（检查扫描器与入口配置；组件下线时按规范下调下界）`)
    }
    for (const issue of result.tierBlockDeclarations) {
        problems.push(`[tier] ${issue.file}: ${issue.selector} 内直接声明属性 ${issue.property}: ${issue.value}（档位块只应声明 CSS 变量）`)
    }
    for (const issue of result.scopedVariableDeclarations) {
        problems.push(`[scope] ${issue.file}: ${issue.selector} 声明 ${issue.property} 但选择器不含 :where(（基类不预声明默认值）`)
    }
    for (const issue of result.nonWhereSizeSelectors) {
        problems.push(`[tier-where] ${issue.file}: ${issue.selector} 中的 ${issue.className} 未用 :where() 归零特异性（尺寸档位只应以 :where(...) 出现）`)
    }
    for (const issue of result.duplicateDeclarations) {
        problems.push(`[dup-decl] ${issue.file}: ${issue.selector} 内 ${issue.property} 重复声明（前值 ${issue.previous} 恒被覆盖）`)
    }
    for (const issue of result.opacityLiterals) {
        problems.push(`[opacity] ${issue.file}: ${issue.selector} 出现禁用态字面量 opacity: ${issue.value}（预算 ${OPACITY_BUDGET}）`)
    }
    for (const issue of result.zIndexLiterals) {
        problems.push(`[z-index] ${issue.file}: ${issue.selector} 出现数字 z-index: ${issue.value}（预算 ${Z_INDEX_BUDGET}，请用 var(--caomei-z-*)）`)
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

    console.info(
        `[check-design] 通过：token 引用有效、无原始 hex 色值、档位常量一致、无旧尺寸命名、`
        + `档位块仅声明变量、scoped 变量声明合规、尺寸档位选择器均经 :where() 归一、`
        + `无同规则重复声明、无禁用态 opacity 字面量、无数字 z-index、受检面未收窄`
        + `（组件样式规则 ${result.scanScopeCount.ruleCount} 条 / 下界 ${MIN_COMPONENT_RULE_COUNT}、声明 ${result.scanScopeCount.declarationCount} 条 / 下界 ${MIN_COMPONENT_DECLARATION_COUNT}，rgb 警告 ${notes.length}/${RGB_BUDGET} 处）`,
    )
}

if (isDirectExecution(import.meta.url)) {
    main()
}
