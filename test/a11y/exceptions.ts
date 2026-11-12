/**
 * 已裁定的既有例外清单（**机检数据**；判定依据与处置见 `docs/design/governance/2026-09-22-m4-1-a11y-baseline-inventory.md` §3）。
 *
 * 该清单只登记「已裁定接受、暂不修复」的命中；**可按规范清零的命中随修复直接移除条目**
 * （条目删除须有等价新增断言；组件测试给出更早、更精确的回归信号，漏网由例外外零违规兜底）。
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
        component: 'CaomeiCalendar',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；日格 `aria-label`（年月日 + 星期）包含可见日期数字，因 value-text 角色与 CJK 分词被标为 needsReview。人工复核：可访问名包含可见文本，静态扫描无法确认分词对齐，按待复核登记',
    },
    {
        component: 'CaomeiDatePicker',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；触发器 `aria-label` 含可见日期文本，value-text 角色下静态扫描无法确认逐词对齐，人工复核名称覆盖可见文本，按待复核登记',
    },
    {
        component: 'CaomeiPaginator',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；页码按钮 `aria-label`「第 N 页」包含可见页码，CJK 分词导致 needsReview。人工复核名称包含可见数字，按待复核登记',
    },
    {
        component: 'CaomeiStepper',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；触发器 `aria-labelledby` 指向步骤标题（含可见序号），CJK 分词导致 needsReview。人工复核名称与可见文本一致，按待复核登记',
    },
    {
        component: 'CaomeiToggleButton',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；`aria-label` 与可见两态文案同源（固定 / 已固定），value-text 角色下静态扫描无法确认，人工复核一致，按待复核登记',
    },
    {
        component: 'CaomeiToolbar',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；工具按钮 `aria-label` 覆盖图标按钮语义（可见文本为空或为图标），静态扫描无法判定图标含义，人工复核名称可独立理解，按待复核登记',
    },
    {
        component: 'CaomeiTooltip',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；触发器 `aria-label` 含可见文本，value-text 角色下静态扫描无法确认逐词对齐，人工复核一致，按待复核登记',
    },
    {
        component: 'CaomeiTooltipContent',
        rule: 'label-content-name-mismatch',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe 4.14 默认启用该规则；提示内容内可交互节点的可见文本与可访问名由内容层决定，静态扫描无法确认，人工复核名称覆盖可见文本，按待复核登记',
    },
    {
        component: 'CaomeiDatePicker',
        rule: 'aria-valid-attr-value',
        kind: 'incomplete',
        count: 1,
        judgment: 'axe `controlsWithinPopup`：`aria-haspopup` + `aria-controls` 指向 portal 内的 popover，静态扫描无法判定引用是否存在（axe 明确标记为 needsReview）。引用目标经组件单测（`受控 open 展开时 aria-controls 指向面板`）与 E2E 实测存在；axe 对 `aria-haspopup` + portal 面板的静态可判定性限制本身无法消除，故按待复核登记',
    },
]

/** 例外清单的稳定键（组件 × 类型 × 规则）。 */
export function exceptionKey(component: string, kind: A11yException['kind'], rule: string): string {
    return `${component}|${kind}|${rule}`
}
