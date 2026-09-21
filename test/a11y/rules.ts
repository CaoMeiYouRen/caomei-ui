import type { AxeResults, Result, RunOptions } from 'axe-core'

/**
 * a11y 审计的规则面（组件级）。
 *
 * 为什么需要禁用清单：axe 默认规则面面向**整页**，且部分规则依赖布局引擎。
 * 本仓的审计对象是**组件**（挂载在 happy-dom 中），因此：
 * 1. 页面级结构规则在本环境下不成立（组件不自带 `main` / 标题 / `lang`）；
 * 2. 依赖布局的规则在无布局引擎（JSDOM / happy-dom）下给不出有效结果：axe 的 JSDOM 支持说明
 *    点名 color-contrast 不可用，其维护者在 https://github.com/dequelabs/axe-core/issues/4021 中
 *    列出更多「在 JSDOM 下无意义」的规则；其余条目按「依赖布局 / 媒体查询 / iframe」逐条自证。
 * 两类禁用都必须逐条登记理由，避免「受检范围被静默收窄」；未禁用规则一旦命中即为违规。
 */
export const DISABLED_RULES: { id: string, reason: string }[] = [
    // 页面级结构：审计对象是组件而非页面
    { id: 'region', reason: '要求整页内容落在 landmark 内，组件挂载点不承担页面骨架' },
    { id: 'landmark-one-main', reason: '要求页面存在唯一 main，组件不自带页面骨架' },
    { id: 'page-has-heading-one', reason: '要求页面存在 h1，组件不自带文档标题层级' },
    { id: 'bypass', reason: '要求页面提供跳转主内容的手段，属页面级' },
    { id: 'document-title', reason: '要求文档有 title，属页面级' },
    { id: 'html-has-lang', reason: '要求 html 声明 lang，属页面级' },
    // 依赖布局引擎：无布局引擎下结果无效（axe 官方建议在 JSDOM 下关闭）
    { id: 'color-contrast', reason: '对比度计算依赖布局与 canvas，无布局引擎下不可用（对比度遗留项见 Backlog）' },
    { id: 'color-contrast-enhanced', reason: '同 color-contrast（AAA 档）' },
    { id: 'target-size', reason: '触摸目标尺寸依赖布局与视口' },
    { id: 'focus-order-semantics', reason: '焦点顺序依赖布局与滚动' },
    { id: 'scrollable-region-focusable', reason: '滚动可达性依赖布局与溢出计算' },
    { id: 'css-orientation-lock', reason: '依赖媒体查询与布局' },
    { id: 'link-in-text-block', reason: '依赖颜色与布局计算' },
    { id: 'avoid-inline-spacing', reason: '依赖样式表计算（JSDOM 不加载外部 CSS）' },
    { id: 'frame-focusable-content', reason: '依赖 iframe 布局与焦点模型' },
    { id: 'frame-tested', reason: '依赖 iframe 内文档，无布局引擎下不可判定' },
]

/** 传给 `axe.run` 的规则配置（由 `DISABLED_RULES` 派生，保证规则面与登记一一对应）。 */
export function buildRuleOptions(disabled: { id: string, reason: string }[] = DISABLED_RULES): RunOptions {
    return {
        rules: Object.fromEntries(disabled.map((rule) => [rule.id, { enabled: false }])),
    }
}

/** 单条违规 / 待复核项的精简形态（用于清单与断言消息）。 */
export interface A11yFinding {
    id: string
    impact: string | null
    /** 命中的元素数 */
    count: number
    /** 首个命中元素的选择器路径（便于定位） */
    target: string
}

/** 一次组件审计的结果摘要。 */
export interface A11yAuditSummary {
    /** 审计对象名（组件族名） */
    name: string
    /** 违规（必须为 0，或命中已登记例外） */
    violations: A11yFinding[]
    /** 待复核（axe 无法判定，须逐条裁定） */
    incomplete: A11yFinding[]
    /** 通过检查项数（用于确认审计确实执行） */
    passes: number
}

/** 把 axe 结果收敛为可断言的摘要（纯函数，便于单测）。 */
export function summarizeResults(name: string, results: Pick<AxeResults, 'violations' | 'incomplete' | 'passes'>): A11yAuditSummary {
    const map = (items: Result[]): A11yFinding[] =>
        items.map((item) => ({
            id: item.id,
            impact: item.impact ?? null,
            count: item.nodes.length,
            target: (item.nodes[0]?.target ?? []).flat().join(' '),
        }))

    return {
        name,
        violations: map(results.violations),
        incomplete: map(results.incomplete),
        passes: results.passes.length,
    }
}
