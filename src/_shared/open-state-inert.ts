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
 * 首击语义：`inert` 不参与命中测试，且浮层族普遍启用指针捕获，**展开态下点击背景的
 * 第一次点击会被丢弃**——面板关闭了，背景控件却没被激活。这里补「首击穿透」：`pointerdown` 的
 * `window` 捕获阶段（早于组件层与 Reka 的 `document` 捕获监听）临时撤掉本模块写入的 `inert`、
 * 取指针下的真实目标，恢复属性后对该目标补派一次 `click`，使「关闭浮层」与「激活背景控件」
 * 由同一次点击完成。
 * - 补派前已恢复 `inert`：原生点击仍落在捕获元素 / `body`，不会双触发；
 * - 指针落在浮层内、非主键、或目标已不在 `inert` 子树（浮层已同步关闭）时不补派。
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
    releasePointerGuard(body.ownerDocument.defaultView)
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

/** 命中测试：默认取 `elementsFromPoint`（可注入，便于 happy-dom 下单测）。 */
type HitTest = (document: Document, x: number, y: number) => Element[]

const defaultHitTest: HitTest = (document, x, y) => {
    // happy-dom 不实现该 API，故按可选能力探测（`lib.dom` 把它标成必有）
    const withHitTest = document as unknown as { elementsFromPoint?: (nx: number, ny: number) => Element[] }
    return typeof withHitTest.elementsFromPoint === 'function' ? withHitTest.elementsFromPoint(x, y) : []
}

let hitTest: HitTest = defaultHitTest

/**
 * 替换命中测试（仅测试用）：happy-dom 不实现 `elementsFromPoint`。传 `undefined` 恢复默认。
 * @internal
 */
export function __setHitTestForTest(next?: HitTest): void {
    hitTest = next ?? defaultHitTest
}

/** 已安装的 `pointerdown` 守卫（按 `window` 登记，最后一个活动层关闭时移除）。 */
const pointerGuards = new WeakMap<Window, (event: PointerEvent) => void>()

/** 判定元素是否属于某个活动层的整棵子树。 */
function insideActiveLayer(element: Element): boolean {
    return activeLayers.some((layer) => layer.root.contains(element))
}

/**
 * 取指针下的**外层真实目标**：临时撤掉本模块写入的 `inert`（命中测试跳过 `inert` 子树），
 * 取 `elementsFromPoint` 中最先出现的、位于所有活动层之外的元素，随后原样恢复。
 */
function resolvePointerTarget(event: PointerEvent, body: HTMLElement): Element | undefined {
    const record = appliedByBody.get(body)
    const restored: Element[] = []
    if (record) {
        for (const element of record.inert) {
            if (element.hasAttribute('inert')) {
                element.removeAttribute('inert')
                restored.push(element)
            }
        }
    }
    try {
        const document = body.ownerDocument
        return hitTest(document, event.clientX, event.clientY).find(
            (element) => element !== document.documentElement && element !== document.body && !insideActiveLayer(element),
        )
    } finally {
        for (const element of restored) {
            element.setAttribute('inert', '')
        }
    }
}

/**
 * 首击穿透：背景上的一次点击既关闭浮层、也激活该控件。
 *
 * 为什么必须补派：浮层族普遍使用**指针捕获**（Reka 在触发器 / 内容上做 `setPointerCapture`），
 * 一旦捕获生效，后续 `mousedown` / `mouseup` / `click` 全部派发给捕获元素，背景控件永远收不到；
 * 且 `inert` 本身也不参与命中测试。两条叠加使「只摘 `inert`」无效（浏览器仍把点击交给捕获元素）。
 * 因此这里取指针下的真实目标后**补派一次 `click`**：
 * - 属性在补派前恢复，原生点击仍落在捕获元素 / `body`，不会与补派叠加成双触发；
 * - 监听挂在 `window` 捕获阶段，早于组件层与 Reka 的 `document` 捕获监听，此时隔离记录仍完整；
 * - 只在指针落在所有活动层之外、且目标此刻仍处于 `inert` 子树（浮层尚未同步关闭）时补派。
 */
function handleOutsidePointerDown(event: PointerEvent): void {
    if (event.button !== 0 || activeLayers.length === 0) {
        return
    }
    const target = event.target
    if (target instanceof Element && insideActiveLayer(target)) {
        return
    }
    const view = event.view
    if (!view) {
        return
    }
    const body = activeLayers.find((layer) => layer.body.ownerDocument === view.document)?.body
    if (!body) {
        return
    }
    // 模态浮层（Reka 把 `body` / 应用根置为 `pointer-events: none`）不穿透：背景本就不可交互，
    // 「点击只关闭」是模态语义；首击穿透只针对非模态浮层（Combobox 一族）。
    if (view.getComputedStyle(body).pointerEvents === 'none') {
        return
    }
    const element = resolvePointerTarget(event, body)
    if (!element?.closest('[inert]')) {
        return
    }
    element.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view,
        clientX: event.clientX,
        clientY: event.clientY,
    }))
}

/** 确保该文档装有首击守卫（幂等）。 */
function ensurePointerGuard(view: Window): void {
    if (pointerGuards.has(view)) {
        return
    }
    const listener = (event: PointerEvent): void => {
        handleOutsidePointerDown(event)
    }
    pointerGuards.set(view, listener)
    view.addEventListener('pointerdown', listener, true)
}

/** 撤掉该文档的首击守卫。 */
function releasePointerGuard(view: Window | null): void {
    if (!view) {
        return
    }
    const listener = pointerGuards.get(view)
    if (!listener) {
        return
    }
    view.removeEventListener('pointerdown', listener, true)
    pointerGuards.delete(view)
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
    const view = body.ownerDocument.defaultView
    if (view) {
        ensurePointerGuard(view)
    }

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
