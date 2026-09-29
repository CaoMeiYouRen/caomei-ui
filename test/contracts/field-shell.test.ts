import { readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * 共享字段外壳的高度契约守卫。
 *
 * 契约：`src/styles/field-shell.css` 的 `.caomei-field` 基类用 `height: var(--caomei-field-height)`
 * 表达**单行控件**高度；任何在模板中应用该基类、且渲染高度可超过单行的控件（当前为原生
 * `<textarea>`）的组件，必须在自身样式里覆盖为 `height: auto`，否则内容会画到边框之外
 * （Textarea 折行内容与滚动条越出圆角即由此产生）。
 *
 * happy-dom 无布局引擎、也不算 scoped CSS，故这里守住**声明**层面；真实几何由
 * `test/e2e/field-overflow.e2e.ts` 与计算样式基线（`test/capture/baseline.json`）承担。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENTS_DIR = join(REPO_ROOT, 'src', 'components')
const SHELL_CSS = join(REPO_ROOT, 'src', 'styles', 'field-shell.css')

/** 共享外壳基类名（`__` / `--` 修饰符不算消费） */
const SHELL_BASE_CLASS = 'caomei-field'
/** 模板中的静态 class 属性（`:class` 动态绑定不在受检面） */
const CLASS_ATTR_RE = /(?:^|\s)class="([^"]*)"/g
/** 高度可超过单行的控件形态 */
const MULTILINE_CONTROL_RE = /<textarea[\s>]/
/** 根规则中的高度覆盖（须落在组件根类规则内，局部修饰类上的同名声明不算） */
const HEIGHT_OVERRIDE_RE = /(?:^|[;{\s])height:\s*auto\b/

export interface SourceFile {
    path: string
    source: string
}

export interface ShellContractIssue {
    path: string
    reason: string
}

/** 应用了共享外壳基类的组件清单（按路径排序） */
export function findShellConsumers(files: SourceFile[]): string[] {
    return files
        .filter((file) => rootClassOf(file.source) !== undefined)
        .map((file) => file.path)
        .sort()
}

/**
 * 组件根类名：与 `caomei-field` 同处一个静态 class 属性的自有类
 * （如 `caomei-textarea` / `caomei-select`）；未消费共享外壳时返回 `undefined`。
 *
 * 只认自有根类，是为了把「覆盖」限定在根规则上——局部修饰类（如
 * `.caomei-textarea--auto-resize`）上的 `height: auto` 不能替代根规则覆盖。
 *
 * **已登记边界**：仅识别**静态 `class` 属性**；`:class` 动态绑定 `caomei-field`
 * 的写法不在受检面（当前无此用法，边界由语料用例固化）。自持外壳的多行字段
 * （MultiSelect / AutoComplete / TagsInput）不走共享外壳，由
 * `test/e2e/field-overflow.e2e.ts` 的真实几何扫描覆盖。
 */
function rootClassOf(source: string): string | undefined {
    for (const match of templateOf(source).matchAll(CLASS_ATTR_RE)) {
        const tokens = match[1].split(/\s+/)
        if (!tokens.includes(SHELL_BASE_CLASS)) {
            continue
        }
        return tokens.find((token) => token.startsWith('caomei-') && token !== SHELL_BASE_CLASS)
    }
    return undefined
}

/** 取根 `<template>` 区块（按标签深度配对，兼容 `v-if` 等嵌套 template） */
function templateOf(source: string): string {
    const start = source.indexOf('<template>')
    if (start < 0) {
        return ''
    }
    const re = /<\/?template[\s>]/g
    re.lastIndex = start
    let depth = 0
    let match: RegExpExecArray | null
    while ((match = re.exec(source))) {
        if (match[0].startsWith('</')) {
            depth -= 1
            if (depth === 0) {
                return source.slice(start, match.index)
            }
        } else {
            depth += 1
        }
    }
    return source.slice(start)
}

function styleOf(source: string): string {
    return [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('\n')
}

/** 拆出平铺样式规则（本项目组件样式不使用 CSS 嵌套） */
function styleRules(style: string): { selector: string, body: string }[] {
    return [...style.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
        selector: match[1].trim(),
        body: match[2],
    }))
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 组件根规则是否声明了 `height: auto`（修饰类规则不计） */
function hasRootHeightOverride(source: string, rootClass: string): boolean {
    const rootSelectorRe = new RegExp(`\\.${escapeRegExp(rootClass)}(?![\\w-])`)
    return styleRules(styleOf(source)).some((rule) => rootSelectorRe.test(rule.selector) && HEIGHT_OVERRIDE_RE.test(rule.body))
}

/**
 * 校验高度契约：多行控件消费共享外壳时必须覆盖高度。
 *
 * @param files 待检源码
 * @returns `consumers` 为外壳消费组件清单；`issues` 为违约项（空数组即通过）
 */
export function checkFieldShellHeightContract(files: SourceFile[]): { consumers: string[], issues: ShellContractIssue[] } {
    const consumers = findShellConsumers(files)
    const issues: ShellContractIssue[] = []

    for (const file of files) {
        const rootClass = rootClassOf(file.source)
        if (rootClass === undefined) {
            continue
        }
        if (!MULTILINE_CONTROL_RE.test(templateOf(file.source))) {
            continue
        }
        if (!hasRootHeightOverride(file.source, rootClass)) {
            issues.push({
                path: file.path,
                reason: `模板渲染多行控件却沿用共享外壳的单行固定高度：根规则 \`.${rootClass}\` 缺少 \`height: auto\` 覆盖`,
            })
        }
    }

    return { consumers, issues }
}

/** 脚手架：构造单组件源码 */
function vueOf(parts: { template: string, style: string, script?: string }): string {
    return [
        '<script setup lang="ts">',
        parts.script ?? '',
        '</script>',
        '',
        '<template>',
        parts.template,
        '</template>',
        '',
        '<style scoped>',
        parts.style,
        '</style>',
    ].join('\n')
}

function collectVueFiles(dir: string): SourceFile[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) {
            return collectVueFiles(full)
        }
        if (!entry.name.endsWith('.vue') || !statSync(full).isFile()) {
            return []
        }
        return [{ path: relative(REPO_ROOT, full).replaceAll('\\', '/'), source: readFileSync(full, 'utf8') }]
    })
}

describe('字段外壳高度契约（判定函数）', () => {
    const cases: { name: string, file: SourceFile, consumers: number, issues: number }[] = [
        {
            name: '多行控件 + 根规则 height: auto 覆盖 → 通过',
            file: { path: 'ok.vue', source: vueOf({ template: '<textarea class="caomei-field caomei-ok" />', style: '.caomei-ok { height: auto; }' }) },
            consumers: 1,
            issues: 0,
        },
        {
            name: '多行控件 + 无覆盖 → 违约',
            file: { path: 'bad.vue', source: vueOf({ template: '<textarea class="caomei-field caomei-bad" />', style: '.caomei-bad { padding: 0; }' }) },
            consumers: 1,
            issues: 1,
        },
        {
            name: '仅修饰类声明 height: auto 不构成根规则覆盖 → 违约',
            file: { path: 'modifier-only.vue', source: vueOf({ template: '<textarea class="caomei-field caomei-bad" />', style: '.caomei-bad--auto-resize { height: auto; }' }) },
            consumers: 1,
            issues: 1,
        },
        {
            name: '单行控件（无 textarea）→ 不要求覆盖',
            file: { path: 'single.vue', source: vueOf({ template: '<input class="caomei-field caomei-single" />', style: '.caomei-single { color: red; }' }) },
            consumers: 1,
            issues: 0,
        },
        {
            name: '仅消费 __control / --size 修饰类 → 不算外壳消费',
            file: { path: 'modifier.vue', source: vueOf({ template: '<input class="caomei-field__control caomei-x--md" />', style: '' }) },
            consumers: 0,
            issues: 0,
        },
        {
            name: '注释里出现类名 → 不算外壳消费',
            file: { path: 'comment.vue', source: vueOf({ template: '<div><!-- 由 .caomei-field 基类提供 --><span>x</span></div>', style: '' }) },
            consumers: 0,
            issues: 0,
        },
        {
            name: '动态 :class 绑定外壳类 → 不在受检面（已登记边界）',
            file: { path: 'dynamic.vue', source: vueOf({ template: '<div :class="[\'caomei-field\', \'caomei-dynamic\']"><textarea /></div>', style: '' }) },
            consumers: 0,
            issues: 0,
        },
    ]

    it.each(cases)('$name', ({ file, consumers, issues }) => {
        const result = checkFieldShellHeightContract([file])
        expect(result.consumers).toHaveLength(consumers)
        expect(result.issues).toHaveLength(issues)
    })
})

describe('字段外壳高度契约（仓库现状）', () => {
    /** 受检面下界：外壳消费组件清单被静默收窄时，守卫会变成空真 */
    const EXPECTED_CONSUMERS = [
        'src/components/input-number/input-number.vue',
        'src/components/input/input.vue',
        'src/components/select/select.vue',
        'src/components/textarea/textarea.vue',
    ]

    it('共享外壳基类仍以固定高度表达单行契约', () => {
        const css = readFileSync(SHELL_CSS, 'utf8')
        expect(css).toContain('height: var(--caomei-field-height)')
    })

    it('仓库内多行控件组件均覆盖高度，无违约', () => {
        const result = checkFieldShellHeightContract(collectVueFiles(COMPONENTS_DIR))
        expect(result.consumers).toEqual(EXPECTED_CONSUMERS)
        expect(result.issues).toEqual([])
    })
})
