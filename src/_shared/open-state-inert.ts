/**
 * 打开态兄弟隔离：给浮层之外的兄弟节点补 `inert`。
 *
 * 背景：Reka UI 的浮层用 `aria-hidden` 包把背景从辅助技术树里摘掉，但 `aria-hidden`
 * 不影响 Tab 序列——背景里的可聚焦元素仍能被键盘命中，axe `aria-hidden-focus` 因此命中
 * 整片背景（Select 展开态实测）。`inert` 同时移除可访问性与可聚焦性，这里按与
 * `aria-hidden` 包相同的「保留链」补齐：浮层自身、焦点哨兵、live region 与 `script`
 * 的**整棵子树**都保留（`aria-hidden` 对目标节点不再下钻），其余兄弟节点逐层拦截。
 *
 * 只接管本次写入的属性：已有 `inert` 的节点（外部模态 / 其它浮层）跳过；
 * 撤销时也只移除本次写入的节点，恢复调用前的 DOM。
 *
 * 落在 `src/_shared/`：本工具不绑定具体组件，供组件层复用；无 SSR 依赖（只在客户端调用）。
 */

/** 可访问性豁免节点：live region 与 `script`（与 `aria-hidden` 包同口径，整棵子树保留） */
const ACCESSIBILITY_EXEMPT_SELECTOR = '[aria-live], script'

/** 焦点哨兵：Reka 放在 `body` 下用于把越界的 Tab 折回浮层，本身必须可聚焦 */
const FOCUS_GUARD_SELECTOR = '[data-reka-focus-guard]'

/**
 * 给 `root` 之外的兄弟节点补 `inert`。
 *
 * `root` 必须在 `body` 直系后代链上（`body.contains(root)`）：自定义 portal 目标
 * 或 shadow DOM 内的浮层不在此列，调用方需自行保证，否则会整片隔离 `body` 兄弟。
 *
 * @param root 需要保留的元素（浮层内容或其包裹层）；其整棵子树都不参与隔离
 * @returns 撤销函数；`root` 已脱离文档时返回空操作
 */
export function suppressOutside(root: Element): () => void {
    const body = root.ownerDocument.body
    if (!body.contains(root)) {
        return () => undefined
    }

    // 整棵子树保留：浮层本体、焦点哨兵、live region 与 script
    const exempt = new Set<Element>([root, ...body.querySelectorAll(`${FOCUS_GUARD_SELECTOR}, ${ACCESSIBILITY_EXEMPT_SELECTOR}`)])

    // 保留链：豁免节点的祖先（body 本身不参与隔离）
    const kept = new Set<Element>()
    for (const element of exempt) {
        let node = element.parentElement
        while (node && node !== body) {
            kept.add(node)
            node = node.parentElement
        }
    }

    const suppressed: Element[] = []
    const walk = (parent: Element): void => {
        for (const child of parent.children) {
            if (exempt.has(child)) {
                continue
            }
            if (kept.has(child)) {
                walk(child)
                continue
            }
            // 已有 `inert`：外部已隔离该子树，按其自身生命周期回退，这里不接管
            if (child.hasAttribute('inert')) {
                continue
            }
            child.setAttribute('inert', '')
            suppressed.push(child)
        }
    }
    walk(body)

    return () => {
        for (const element of suppressed) {
            element.removeAttribute('inert')
        }
    }
}
