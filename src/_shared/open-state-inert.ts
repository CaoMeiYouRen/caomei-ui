/**
 * 打开态兄弟隔离：给浮层之外的兄弟节点补 `inert`。
 *
 * 背景：Reka UI 的浮层用 `aria-hidden` 包把背景从辅助技术树里摘掉，但 `aria-hidden`
 * 不影响 Tab 序列——背景里的可聚焦元素仍能被键盘命中，axe `aria-hidden-focus` 因此命中
 * 整片背景（Select 展开态实测）。`inert` 同时移除可访问性与可聚焦性，这里按与
 * `aria-hidden` 包相同的「保留链」补齐：浮层自身、焦点哨兵、live region 与 `script`
 * 的**整棵子树**都保留（`aria-hidden` 对目标节点不再下钻），其余兄弟节点逐层拦截。
 *
 * 多层边界（同一时刻多个浮层展开）：本模块维护**活动层登记表**，每次打开 / 关闭都按
 * 「当前全部活动层」重算隔离面，而不是各自记录自己写过什么。
 * - 后开者不需要「接管」先开者写入的 `inert`：重算时先开者的写入仍算本模块所有，不会被
 *   误判为外部隔离；
 * - 先关者不会提前解除：它关闭后仍有其它活动层，被其它层需要的节点继续保留 `inert`，
 *   只有原先开者专属的宿主链（此时已成为背景）才补上；
 * - 关闭顺序不影响最终恢复：全部层关闭后统一撤销本模块写入的属性。
 *
 * 文档边界：活动层与写入记录都按 `body` 分组，不同文档（iframe / 独立 `document`）的
 * 隔离面互不影响；重算只操作当前 `body` 的写入记录。
 *
 * 属性配对：隔离节点同时写 `inert` 与 `aria-hidden="true"`。`inert` 已移除可访问性与可聚焦性，
 * `aria-hidden` 在此与 Reka Select 的背景隐藏同口径，使 Select / Combobox 两类浮层的隔离面
 * 一致（Reka Combobox 自身不隐藏背景），也让 `aria-hidden-focus` 规则对「属性在但不生效」
 * 的退化保持可判。
 *
 * 只接管本模块写入的属性：重算时刻已带 `inert` 且不在本模块记录里的节点（外部模态 /
 * 其它浮层）始终跳过；撤销时也只移除本模块写入的节点。外部在打开期间移除 `inert` 时，
 * 下一次重算会补写（记录与属性对齐，隔离不会静默失效）；外部已有的 `aria-hidden` 不接管、
 * 不撤销。
 *
 * 落在 `src/_shared/`：本工具不绑定具体组件，供组件层复用；无 SSR 依赖（只在客户端调用）。
 */

/** 可访问性豁免节点：live region 与 `script`（与 `aria-hidden` 包同口径，整棵子树保留） */
const ACCESSIBILITY_EXEMPT_SELECTOR = '[aria-live], script'

/** 焦点哨兵：Reka 放在 `body` 下用于把越界的 Tab 折回浮层，本身必须可聚焦 */
const FOCUS_GUARD_SELECTOR = '[data-reka-focus-guard]'

/** 一个活动层：浮层根与其所属文档的 `body` */
interface ActiveLayer {
    root: Element
    body: HTMLElement
}

/** 活动层登记表（按打开顺序；关闭时按层对象移除） */
const activeLayers: ActiveLayer[] = []

/** 某个 `body` 上的写入记录：`inert` 与 `aria-hidden` 分别记账，撤销只动本模块写入的属性 */
interface AppliedRecord {
    inert: Set<Element>
    ariaHidden: Set<Element>
}

/** 本模块的写入记录，按 `body` 分组 */
const appliedByBody = new Map<HTMLElement, AppliedRecord>()

/** 取（必要时创建）某个 `body` 的写入记录 */
function appliedOf(body: HTMLElement): AppliedRecord {
    let record = appliedByBody.get(body)
    if (!record) {
        record = { inert: new Set<Element>(), ariaHidden: new Set<Element>() }
        appliedByBody.set(body, record)
    }
    return record
}

/** 按当前活动层重算某个 `body` 的隔离面：先撤销不再需要的写入，再补齐新需要的节点 */
function applyLayers(body: HTMLElement): void {
    const record = appliedOf(body)

    // 整棵子树保留：本 body 内各层浮层本体、焦点哨兵、live region 与 script
    const exempt = new Set<Element>()
    for (const layer of activeLayers) {
        if (layer.body === body) {
            exempt.add(layer.root)
        }
    }
    for (const element of body.querySelectorAll(`${FOCUS_GUARD_SELECTOR}, ${ACCESSIBILITY_EXEMPT_SELECTOR}`)) {
        exempt.add(element)
    }

    // 保留链：豁免节点的祖先（body 本身不参与隔离）
    const kept = new Set<Element>()
    for (const element of exempt) {
        let node = element.parentElement
        while (node && node !== body) {
            kept.add(node)
            node = node.parentElement
        }
    }

    const next = new Set<Element>()
    const walk = (parent: Element): void => {
        for (const child of parent.children) {
            if (exempt.has(child)) {
                continue
            }
            if (kept.has(child)) {
                walk(child)
                continue
            }
            // 已带 `inert` 且不是本模块写入：外部已隔离该子树，按其自身生命周期回退
            if (child.hasAttribute('inert') && !record.inert.has(child)) {
                continue
            }
            next.add(child)
        }
    }
    walk(body)

    for (const element of [...record.inert]) {
        if (!next.has(element)) {
            element.removeAttribute('inert')
            record.inert.delete(element)
        }
    }
    for (const element of [...record.ariaHidden]) {
        if (!next.has(element)) {
            element.removeAttribute('aria-hidden')
            record.ariaHidden.delete(element)
        }
    }
    for (const element of next) {
        // 属性可能被外部移除：重算时补齐，使记录与 DOM 对齐
        if (!element.hasAttribute('inert')) {
            element.setAttribute('inert', '')
        }
        record.inert.add(element)
        // 外部已写 `aria-hidden` 的节点不接管，撤销时也不移除
        if (!element.hasAttribute('aria-hidden')) {
            element.setAttribute('aria-hidden', 'true')
            record.ariaHidden.add(element)
        }
    }
}

/** 撤销本模块在某个 `body` 上的全部写入 */
function releaseBody(body: HTMLElement): void {
    const record = appliedByBody.get(body)
    if (!record) {
        return
    }
    for (const element of record.inert) {
        element.removeAttribute('inert')
    }
    for (const element of record.ariaHidden) {
        element.removeAttribute('aria-hidden')
    }
    appliedByBody.delete(body)
}

/**
 * 给 `root` 之外的兄弟节点补 `inert`；多个浮层同时展开时按活动层重算隔离面。
 *
 * `root` 必须在 `body` 直系后代链上（`body.contains(root)`）：自定义 portal 目标
 * 或 shadow DOM 内的浮层不在此列，调用方需自行保证，否则会整片隔离 `body` 兄弟；
 * `root` 为 `body` 本身属非法入参（会隔离整页），按空操作处理。
 *
 * @param root 需要保留的元素（浮层内容或其包裹层）；其整棵子树都不参与隔离
 * @returns 撤销函数（幂等）；`root` 不在 `body` 内或等于 `body` 时返回空操作
 */
export function suppressOutside(root: Element): () => void {
    const body = root.ownerDocument.body
    if (root === body || !body.contains(root)) {
        return () => undefined
    }

    const layer: ActiveLayer = { root, body }
    activeLayers.push(layer)
    applyLayers(body)

    let released = false
    return () => {
        if (released) {
            return
        }
        released = true
        const index = activeLayers.indexOf(layer)
        if (index !== -1) {
            activeLayers.splice(index, 1)
        }
        // 按 body 判定：本 body 已无活动层就只恢复本 body，其它文档的浮层不受影响
        if (!activeLayers.some((active) => active.body === body)) {
            releaseBody(body)
            return
        }
        // 本 body 仍有其它活动层：按剩余层重算，先关者不得提前解除其隔离
        applyLayers(body)
    }
}

/**
 * 仅供测试：清空活动层与写入记录，避免用例之间互相泄漏。
 * 不改变 DOM 属性（调用方自行清理 `body`）。
 * @internal
 */
export function __resetIsolationForTest(): void {
    activeLayers.length = 0
    appliedByBody.clear()
}
