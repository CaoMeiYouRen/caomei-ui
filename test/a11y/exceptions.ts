/**
 * 已裁定的既有例外清单（**机检数据**，与 `docs/design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md` §3 一一对应）。
 *
 * 断言口径（见 `a11y.test.ts`）：
 * 1. 每个组件的违规 / 待复核项必须 ⊆ 本清单（**例外外零违规**）；
 * 2. 本清单登记的每一条**必须仍然命中且命中节点数不变**（`count` 指纹）——修复落地或命中面
 *    变化后须重新裁定并更新该条，避免例外清单腐烂成永久豁免（改动会在 diff 中显式可见）。
 *    不校验 `target` 选择器：它随 class / DOM 结构正常演进变化，断言它只会引入假失败。
 */
export interface A11yException {
    /** 受检对象名（夹具根组件名，须 ∈ `A11Y_FIXTURES`） */
    component: string
    /** axe 规则 id */
    rule: string
    /** 命中类型：违规 / 待复核 */
    kind: 'violation' | 'incomplete'
    /** 命中节点数指纹（受检面内的命中面大小；变化须重新裁定） */
    count: number
    /** 判定依据（含证据指针） */
    judgment: string
}

export const A11Y_EXCEPTIONS: A11yException[] = [
    {
        component: 'CaomeiToastProvider',
        rule: 'aria-hidden-focus',
        kind: 'violation',
        count: 2,
        judgment: 'Reka `Toast/FocusProxy` 的 `VisuallyHidden` + `tabindex="0"` 焦点哨兵（上游有意模式，非本库标记）；依据见 `docs/design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md` §3',
    },
    {
        component: 'CaomeiMultiSelect',
        rule: 'aria-valid-attr-value',
        kind: 'incomplete',
        count: 1,
        judgment: '关闭态 `aria-controls=""`（开启态指向正确面板 id，真实 Chromium 实测）；依据见 `docs/design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md` §3',
    },
    {
        component: 'CaomeiCalendar',
        rule: 'aria-prohibited-attr',
        kind: 'incomplete',
        count: 1,
        judgment: '`aria-label` 落在 `role=generic` 容器（真实 Chromium AX 树名称可解析，ARIA 规范上仍属偏差）；依据见 `docs/design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md` §3',
    },
]

/** 例外清单的稳定键（组件 × 类型 × 规则）。 */
export function exceptionKey(component: string, kind: A11yException['kind'], rule: string): string {
    return `${component}|${kind}|${rule}`
}
