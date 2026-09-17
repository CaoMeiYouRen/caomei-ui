/**
 * Dialog 断点宽度的解析与 CSS 生成。
 *
 * 采用**媒体查询**而非 JS 视口分支：断点键即视口宽度上限，与[响应式设计 §2](../../../../docs/design/responsive.md)
 * 的桌面优先口径一致（统一 `width <=`、不使用 `min-width`），不引入 `matchMedia` 监听。
 *
 * 前提（承重假设）：生成的规则由面板自身的 `<style>` 承载，其**源序**晚于 `head` 中的 scoped 基线；
 * 二者特异性同为 (0,2,0)，靠源序 tie-break 生效。若面板的 Portal 目标或样式注入位置改变，需复核本模块。
 */

/** 断点键：视口宽度上限，仅接受 px 长度（`640px` / `1199px`） */
const BREAKPOINT_KEY_RE = /^\d+(?:\.\d+)?px$/

/** 断点值：面板宽度，仅接受受限的安全 CSS 长度，避免把任意声明注入媒体查询 */
const BREAKPOINT_VALUE_RE = /^\d*\.?\d+(?:px|%|vw|vh|vmin|vmax|rem|em|ch)$/

let breakpointSeed = 0

/**
 * 生成实例断点 id。
 *
 * 使用模块级自增而非 `useId()`：`useId()` 的计数按 Vue app 独立，同页多 app 会同时从 `v-0` 起、
 * 令 A 的断点规则串扰到 B 的面板。面板内容经 Reka Teleport 在 `useMounted()` 后才挂载（仅客户端），
 * 故模块级计数不涉及 SSR / 水合一致性。
 */
export function createDialogBreakpointId(): string {
    breakpointSeed += 1
    return `caomei-dialog-bp-${breakpointSeed}`
}

export interface DialogBreakpointEntry {
    /** 视口宽度上限，如 `640px` */
    maxWidth: string
    /** 面板宽度，如 `100vw` */
    width: string
}

/**
 * 解析断点对象：丢弃键 / 值非法的条目，并按视口上限**从宽到窄**排序。
 *
 * 排序使生成的规则中窄档在后，多条命中时由最窄档覆盖——与键顺序无关，避免使用方书写顺序影响结果。
 */
export function parseDialogBreakpoints(
    breakpoints?: Record<string, string>,
): DialogBreakpointEntry[] {
    if (!breakpoints) {
        return []
    }
    const entries: DialogBreakpointEntry[] = []
    for (const [rawKey, rawValue] of Object.entries(breakpoints)) {
        const maxWidth = rawKey.trim()
        const width = typeof rawValue === 'string' ? rawValue.trim() : ''
        if (!BREAKPOINT_KEY_RE.test(maxWidth) || !BREAKPOINT_VALUE_RE.test(width)) {
            continue
        }
        entries.push({ maxWidth, width })
    }
    return entries.sort(
        (left, right) => Number.parseFloat(right.maxWidth) - Number.parseFloat(left.maxWidth),
    )
}

/** 以实例选择器限定生成媒体查询；入参（选择器与值）均已受校验 */
export function buildDialogBreakpointCss(
    selector: string,
    entries: DialogBreakpointEntry[],
): string {
    return entries
        .map((entry) => `@media (width <= ${entry.maxWidth}) { ${selector} { width: ${entry.width}; } }`)
        .join('\n')
}
