/**
 * 模态浮层的页面滚动锁（含滚动条宽度补偿）。
 *
 * 依据[主题与样式设计 §5.1](../../../docs/design/theming.md#_5-1-浮层滚动锁与布局稳定性)的决策 ①：
 * 移除滚动条并给 `body` 补 `padding-right`，使遮罩（`position: fixed; inset: 0`）完整覆盖视口；
 * 代价是 `fixed` / `100%` 视口元素随视口宽度变化，属预期的模态行为。
 *
 * 多实例（嵌套模态 / 同时打开的浮层）按引用计数共享同一把锁：后开者不重复记录样式，
 * 先关者不提前解除，全部释放后统一还原为打开前的内联值。
 */

interface LockRecord {
    /** 当前持锁方数量 */
    count: number
    document: Document
    /** 打开前 `html` 的 `overflow` 内联值（含空串） */
    rootOverflow: string
    /** 打开前 `body` 的 `padding-right` 内联值（含空串） */
    bodyPaddingRight: string
    /** 打开前 `body` 的计算 `padding-right`（px），用于叠加滚动条宽度 */
    basePaddingRight: number
}

let record: LockRecord | null = null

/**
 * 取滚动条宽度（px）：overlay scrollbar 与无滚动条环境均为 0。
 *
 * `clientWidth` 为 0 表示当前环境不做布局（SSR 直出 / 测试 DOM），此时不能把整幅视口宽
 * 误判成滚动条宽度。
 */
function scrollbarWidth(doc: Document, win: Window): number {
    const clientWidth = doc.documentElement.clientWidth
    if (clientWidth <= 0) {
        return 0
    }
    return Math.max(win.innerWidth - clientWidth, 0)
}

/**
 * 锁定页面滚动，返回幂等的释放函数。
 *
 * 只在浏览器环境调用；服务端（无 `document`）直接返回空释放函数。
 */
export function lockScroll(doc: Document | undefined = typeof document === 'undefined' ? undefined : document): () => void {
    const win = doc?.defaultView
    if (!doc || !win) {
        return () => undefined
    }

    if (!record) {
        const body = doc.body
        const computed = win.getComputedStyle(body).paddingRight
        // 必须先测宽再隐藏滚动条：`overflow: hidden` 生效后滚动条已被移除，
        // 再读 `innerWidth - clientWidth` 恒为 0，补偿分支会静默失效。
        const width = scrollbarWidth(doc, win)
        record = {
            count: 0,
            document: doc,
            rootOverflow: doc.documentElement.style.overflow,
            bodyPaddingRight: body.style.paddingRight,
            basePaddingRight: Number.parseFloat(computed) || 0,
        }
        doc.documentElement.style.overflow = 'hidden'
        if (width > 0) {
            body.style.paddingRight = `${record.basePaddingRight + width}px`
        }
    }
    record.count += 1

    let released = false
    return () => {
        if (released || !record) {
            return
        }
        released = true
        record.count -= 1
        if (record.count > 0) {
            return
        }
        const current = record
        record = null
        current.document.documentElement.style.overflow = current.rootOverflow
        current.document.body.style.paddingRight = current.bodyPaddingRight
    }
}
