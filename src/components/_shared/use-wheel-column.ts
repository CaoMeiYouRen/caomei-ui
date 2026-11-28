import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch, type ComputedRef, type Ref } from 'vue'

/**
 * 滚轮选择列的共享交互（时间轮与通用选择器同口径）。
 *
 * 为什么抽在这里：`TimePicker` 的 wheel 模式与 `Picker` 的列是**同一套手势与键盘语义**
 * （吸附滚动、滚动停下取最近项、方向键 / PageUp / PageDown / Home / End），分别实现会让
 * 「动量收敛延迟」「程序化对齐的忽略窗口」这类时序细节分叉。这里把逻辑收成一份，两个组件
 * 只保留各自的模板与样式。
 *
 * 判定口径（与既有 `TimePicker` 行为保持一致，重构前后为零行为变更）：
 * - **吸附**：`scroll-snap-type: y mandatory` 由样式承担，逻辑只负责「停下后取最近项」；
 * - **动量收敛**：滚动事件不断重置 140ms 计时器，最后一次滚动后取 `scrollTop / 行高` 的四舍五入值；
 * - **程序化对齐**：写入 `scrollTop` 后置 200ms 忽略窗口，避免对齐产生的 scroll 事件被当成用户选择；
 * - **循环**：`loop` 只作用于键盘与点击（首尾相接）；**滚动不产生无限滚动**——无限滚动需要在
 *   首尾复制多份选项，会让 `scrollTop` 与当前项语义脱耦，故不做（文档已写明）。
 */

/** 滚轮列选项的最小形态（时间轮与通用选择器共用） */
export interface WheelColumnOption {
    label: string
    value: string | number
}

/** 程序化滚动后忽略滚动事件的窗口（毫秒） */
export const WHEEL_SCROLL_IGNORE_MS = 200

/** 动量收敛的静默窗口（毫秒）：最后一次滚动后等待该时长再判定落点 */
export const WHEEL_SETTLE_MS = 140

export interface UseWheelColumnOptions {
    /** 选项列表（响应式来源） */
    options: () => WheelColumnOption[]
    /** 当前值 */
    modelValue: () => string | number
    /** 是否禁用 */
    disabled?: () => boolean
    /** 是否只读 */
    readonly?: () => boolean
    /** 行高兜底（元素未布局时使用，默认 36px） */
    itemHeightFallback?: number
    /** 首尾相接（键盘与点击） */
    loop?: () => boolean
    /** 值变化回调 */
    onChange: (value: string | number) => void
}

export interface UseWheelColumnReturn {
    columnEl: Ref<HTMLElement | undefined>
    selectedIndex: ComputedRef<number>
    interactive: ComputedRef<boolean>
    optionId: (index: number) => string
    scrollToIndex: (index: number) => void
    onScroll: () => void
    selectIndex: (index: number) => void
    onOptionClick: (index: number) => void
    onKeydown: (event: KeyboardEvent) => void
}

/**
 * 首尾相接的索引计算：`loop` 开启时越界回绕，否则夹到边界。
 *
 * @param index 目标下标（可能越界）
 * @param last 末项下标
 * @param direction 越界方向（`back` 上越界 / `forward` 下越界）
 * @param wraps 是否回绕
 */
export function wrapIndex(index: number, last: number, direction: 'back' | 'forward', wraps: boolean): number {
    if (index >= 0 && index <= last) {
        return index
    }
    if (wraps) {
        return direction === 'back' ? last : 0
    }
    return direction === 'back' ? 0 : last
}

export function useWheelColumn(options: UseWheelColumnOptions): UseWheelColumnReturn {
    const id = useId()
    const columnEl = ref<HTMLElement>()
    const interactive = computed(() => !options.disabled?.() && !options.readonly?.())
    const itemHeightFallback = options.itemHeightFallback ?? 36

    /** 当前选中项下标；模型值不在候选中时回退首项，避免滚动位置与模型脱节 */
    const selectedIndex = computed(() => {
        const index = options.options().findIndex((option) => option.value === options.modelValue())
        return index < 0 ? 0 : index
    })

    function optionId(index: number): string {
        return `${id}-option-${index}`
    }

    function itemHeight(el: HTMLElement): number {
        const option = el.querySelector<HTMLElement>('[role="option"]')
        const height = option?.offsetHeight ?? 0
        return height > 0 ? height : itemHeightFallback
    }

    /** 时间源：用 `Date.now()` 而非 `performance.now()`——两者在生产等价（毫秒级窗口），
     *  但只有前者能被测试的假计时器推进，吸附 / 忽略窗口因此可在单测里稳定复现。 */
    const now = (): number => Date.now()

    /** 程序化对齐：把目标项滚到中央；置忽略窗口，避免滚动事件把对齐结果当成用户选择 */
    let ignoreScrollUntil = 0

    function scrollToIndex(index: number): void {
        const el = columnEl.value
        if (!el) {
            return
        }
        ignoreScrollUntil = now() + WHEEL_SCROLL_IGNORE_MS
        el.scrollTop = index * itemHeight(el)
    }

    let settleTimer: ReturnType<typeof setTimeout> | undefined

    function clearSettleTimer(): void {
        if (settleTimer !== undefined) {
            clearTimeout(settleTimer)
            settleTimer = undefined
        }
    }

    /** 滚动停下后取最近一项；触屏惯性滚动同样走这条路径 */
    function onScroll(): void {
        if (!interactive.value) {
            return
        }
        if (now() < ignoreScrollUntil) {
            return
        }
        clearSettleTimer()
        settleTimer = setTimeout(() => {
            const el = columnEl.value
            const list = options.options()
            if (!el || !list.length) {
                return
            }
            const index = Math.min(list.length - 1, Math.max(0, Math.round(el.scrollTop / itemHeight(el))))
            const option = list[index]
            if (option.value !== options.modelValue()) {
                options.onChange(option.value)
            }
        }, WHEEL_SETTLE_MS)
    }

    function selectIndex(index: number): void {
        if (!interactive.value) {
            return
        }
        const list = options.options()
        if (index < 0 || index >= list.length) {
            return
        }
        const option = list[index]
        if (option.value === options.modelValue()) {
            return
        }
        options.onChange(option.value)
        scrollToIndex(index)
    }

    function onOptionClick(index: number): void {
        columnEl.value?.focus()
        selectIndex(index)
    }

    function onKeydown(event: KeyboardEvent): void {
        const list = options.options()
        if (!interactive.value || !list.length) {
            return
        }
        const wraps = options.loop?.() ?? false
        const last = list.length - 1
        // 列表方向（APG listbox）：↓ 下一条、↑ 上一条，与滚轮滚动方向一致
        let next = selectedIndex.value
        if (event.key === 'ArrowUp') {
            next = wrapIndex(next - 1, last, 'back', wraps)
        } else if (event.key === 'ArrowDown') {
            next = wrapIndex(next + 1, last, 'forward', wraps)
        } else if (event.key === 'PageUp') {
            next = Math.max(0, next - 5)
        } else if (event.key === 'PageDown') {
            next = Math.min(last, next + 5)
        } else if (event.key === 'Home') {
            next = 0
        } else if (event.key === 'End') {
            next = last
        } else {
            return
        }
        event.preventDefault()
        selectIndex(next)
    }

    watch(
        () => options.modelValue(),
        () => {
            void nextTick(() => {
                scrollToIndex(selectedIndex.value)
            })
        },
    )

    watch(
        () => options.options().length,
        () => {
            void nextTick(() => {
                scrollToIndex(selectedIndex.value)
            })
        },
    )

    onMounted(() => {
        void nextTick(() => {
            scrollToIndex(selectedIndex.value)
        })
    })

    onBeforeUnmount(clearSettleTimer)

    return {
        columnEl,
        selectedIndex,
        interactive,
        optionId,
        scrollToIndex,
        onScroll,
        selectIndex,
        onOptionClick,
        onKeydown,
    }
}
