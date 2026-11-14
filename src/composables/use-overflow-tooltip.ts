import { onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export interface UseOverflowTooltipOptions {
    /**
     * 是否停用检测；停用期间不测量，`overflowing` 恒为 `false`。
     * @en Whether detection is disabled; while disabled nothing is measured and `overflowing` stays `false`.
     */
    disabled?: MaybeRefOrGetter<boolean | undefined>
    /**
     * 亚像素容差：`scrollWidth` 需**严格大于** `clientWidth + tolerance` 才判为溢出。
     * @default 1
     * @en Sub-pixel tolerance: `scrollWidth` must be **strictly greater** than `clientWidth + tolerance` to count as overflowing.
     */
    tolerance?: number
    /**
     * 每次测量后调用，供调用方同步「当前可见文本」这类衍生状态。
     * @en Called after every measurement, so callers can sync derived state such as the current visible text.
     */
    onMeasure?: () => void
}

export interface UseOverflowTooltipReturn {
    /**
     * 目标元素的可视宽度是否装不下内容。
     * @en Whether the content does not fit the target element's visible width.
     */
    overflowing: Ref<boolean>
}

/**
 * 检测元素内容是否溢出（用于「只在文本被截断时显示提示」）。
 *
 * **内部能力**：未从包根导出，只供组件库内的提示接线使用（公开入口是 `CaomeiTooltipText` 与
 * 各组件的 `tooltip` prop）；需要对外时再评估其契约与测试面。
 *
 * 判据为 `scrollWidth > clientWidth + tolerance`，前提是目标元素已具备截断样式
 * （`white-space: nowrap` + 定宽 / `max-width` + `overflow: hidden`），否则 `scrollWidth`
 * 恒等于 `clientWidth`、检测不会成立。
 *
 * 重测时机：挂载、字体加载完成、容器 resize、子节点 / 文本变化；SSR 期间不测量（服务端无布局），
 * 首帧水合前 `overflowing` 恒为 `false`，因此不会在无布局信息时误报。
 *
 * 必须在 `setup()` 内调用（依赖组件的生命周期钩子）。
 */
export function useOverflowTooltip(
    target: MaybeRefOrGetter<HTMLElement | null | undefined>,
    options: UseOverflowTooltipOptions = {},
): UseOverflowTooltipReturn {
    const tolerance = options.tolerance ?? 1
    const overflowing = ref(false)
    let resizeObserver: ResizeObserver | undefined
    let mutationObserver: MutationObserver | undefined
    let observed: HTMLElement | null = null
    let disposed = false

    function measure(): void {
        if (disposed) {
            return
        }
        const element = toValue(target)
        const measurable = Boolean(element) && typeof window !== 'undefined' && !toValue(options.disabled)
        overflowing.value = measurable && element !== null && element !== undefined
            ? element.scrollWidth > element.clientWidth + tolerance
            : false
        options.onMeasure?.()
    }

    function disconnect(): void {
        resizeObserver?.disconnect()
        mutationObserver?.disconnect()
        resizeObserver = undefined
        mutationObserver = undefined
        observed = null
    }

    function observe(element: HTMLElement | null): void {
        if (element === observed) {
            return
        }
        disconnect()
        if (!element) {
            measure()
            return
        }
        observed = element
        if (typeof ResizeObserver !== 'undefined') {
            resizeObserver = new ResizeObserver(() => {
                measure()
            })
            resizeObserver.observe(element)
        }
        if (typeof MutationObserver !== 'undefined') {
            mutationObserver = new MutationObserver(() => {
                measure()
            })
            mutationObserver.observe(element, { characterData: true, childList: true, subtree: true })
        }
        measure()
    }

    onMounted(() => {
        observe(toValue(target) ?? null)
        // 字体加载会改变文本宽度：`document.fonts.ready` 解析后补测一次；环境无该 API 时跳过。
        const fonts = (document as unknown as { fonts?: { ready: Promise<unknown> } }).fonts
        fonts?.ready.then(() => {
            measure()
        }, () => {
            // 字体加载失败不影响溢出检测的其余时机，保持静默。
        })
    })

    watch(() => toValue(target), (element) => {
        observe(element ?? null)
    })

    // 运行期启用 / 停用（如 `tooltip` 动态打开、`disabled` 由 true 转 false）时立即重测，
    // 否则 `overflowing` 会停在停用时的旧值，直到下一次 resize / 文本变化。
    watch(() => toValue(options.disabled), () => {
        measure()
    }, { flush: 'post' })

    onBeforeUnmount(() => {
        disposed = true
        disconnect()
    })

    return { overflowing }
}
