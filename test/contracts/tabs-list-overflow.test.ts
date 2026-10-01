import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * TabList 滚动轴对契约守卫。
 *
 * 契约：`.caomei-tabs__list` 基类的**有效两轴**必须是「横向可滚动 + 纵向不可滚动」
 * （`overflow-x: auto` / `overflow-y: hidden`，写法可为简写 `overflow: auto hidden`）。
 * 理由：只声明横向时，另一轴的 `visible` 会被 CSS overflow 计算规则改成 `auto`；而触发器
 * `.caomei-tabs__trigger` 的 `margin-bottom: -1px` 让它的边框盒比列表内容盒向下多出 1px
 * （用于让激活下划线压住列表下边框），这 1px 纵向溢出会被渲染成一条多余的纵向滚动条，
 * 且滚轮在列表上滚动会把内容顶起 1px（真实 Chromium 实测：`overflow-y: auto` 时
 * `scrollHeight` 38 > `clientHeight` 37、`scrollTop` 由 0 变 1；纵向置 `hidden` 后滚轮不再生效）。
 *
 * 契约同时要求纵向排布覆盖保持 `overflow: visible`：纵向指示条靠 `margin-right: -1px` 越出内容盒
 * 1px 压住右边框，任一轴裁剪都会削掉它。
 *
 * happy-dom 无布局引擎、也不算 scoped CSS，故此处只守**声明**层面；真实几何（无纵向滚动条、
 * 横向滚动仍可用、纵向列表不受影响）由 `test/e2e/tabs-list-overflow.e2e.ts` 在真实 Chromium 中守卫。
 */

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const COMPONENT_FILE = join(REPO_ROOT, 'src', 'components', 'tabs', 'tabs-list.vue')

/** 基类规则块：行首（仅允许前导空白）的 `.caomei-tabs__list {` —— 不会命中 `:where(...) .caomei-tabs__list {` */
const BASE_RULE_RE = /^\s*\.caomei-tabs__list\s*\{([^}]*)\}/m
/** 纵向覆盖规则块（`:where(.caomei-tabs--vertical) .caomei-tabs__list {` 到配对 `}`） */
const VERTICAL_RULE_RE = /:where\(\.caomei-tabs--vertical\)\s*\.caomei-tabs__list\s*\{([^}]*)\}/

/**
 * 取规则块正文，并断言该形态**唯一**：重复声明同名基类时只读首个会让守卫静默 fail-open
 * （后置规则才是实际生效者）。
 */
function ruleBody(pattern: RegExp, source: string): string {
    const matches = [...source.matchAll(new RegExp(pattern.source, 'gm'))]
    expect(
        matches.length,
        `匹配 ${pattern} 的规则块应唯一，实际 ${matches.length} 个（重复声明会让守卫只看首个而漏判）`,
    ).toBe(1)
    return matches[0]?.[1] ?? ''
}

/**
 * 求一条规则块里 overflow 两轴的**有效取值**：先取 `overflow` 简写（两值语法逐轴赋值、
 * 单值语法两轴同值），再由 `overflow-x` / `overflow-y` 长写覆盖。未知取值（含 `var()`、
 * 关键字外形态）直接判为 `null`，由用例 fail-closed。
 *
 * @param body 规则块正文
 * @returns `{ x, y }` 两轴有效值；无法静态判定时为 `null`
 */
function effectiveOverflow(body: string): { x: string, y: string } | null {
    // 先剥离注释：承重声明旁的说明文字同样含 `overflow-x: auto` 字样，不剥离会被误当声明解析
    const source = body.replace(/\/\*[\s\S]*?\*\//g, ' ')
    const declarations = [...source.matchAll(/(?:^|[;{])\s*(overflow(?:-x|-y)?)\s*:\s*([^;}]+)/g)]
    let pair: { x: string, y: string } | null = null

    for (const [, property = '', rawValue = ''] of declarations) {
        const values = rawValue.trim().split(/\s+/).filter(Boolean)
        const first = values[0]
        if (first === undefined || !values.every((value) => /^[a-z]+$/.test(value))) {
            return null
        }
        const second = values[1] ?? first

        if (property === 'overflow') {
            if (values.length > 2) {
                return null
            }
            pair = { x: first, y: second }
            continue
        }
        if (!pair) {
            // 只声明单轴时，另一轴的计算值取决于「另一轴是否为 visible」——本文档要求成对声明，
            // 无法成对推导的形态一律 fail-closed
            return null
        }
        pair = property === 'overflow-x' ? { x: first, y: pair.y } : { x: pair.x, y: first }
    }

    return pair
}

describe('TabList 滚动轴对契约', () => {
    it('基类的有效两轴为「横向 auto + 纵向 hidden」', () => {
        const pair = effectiveOverflow(ruleBody(BASE_RULE_RE, readFileSync(COMPONENT_FILE, 'utf8')))

        expect(pair, 'overflow 两轴须成对声明且取值可静态判定（不得用 var() 等不可判定形态）').not.toBeNull()
        expect(pair?.x, '列表需要保留横向滚动能力').toBe('auto')
        expect(
            pair?.y,
            '纵向不得是可滚动值：横向声明会让纵向的 visible 计算为 auto，触发器的 -1px 越界会变成纵向滚动条',
        ).toBe('hidden')
    })

    it('纵向覆盖保持 overflow: visible（纵向指示条依赖 -1px 越界压住右边框）', () => {
        const pair = effectiveOverflow(ruleBody(VERTICAL_RULE_RE, readFileSync(COMPONENT_FILE, 'utf8')))

        expect(pair, '纵向覆盖须给出可静态判定的两轴取值').not.toBeNull()
        expect(pair?.x, '纵向列表不得被横向裁剪').toBe('visible')
        expect(pair?.y, '纵向列表不得被纵向裁剪（指示条依赖 1px 越界压住右边框）').toBe('visible')
    })
})
