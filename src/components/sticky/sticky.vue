<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { StickyProps } from './types'

defineOptions({ name: 'CaomeiSticky', inheritAttrs: false })

const props = withDefaults(defineProps<StickyProps>(), {
    offset: 0,
    disabled: false,
})

const emit = defineEmits<{
    /**
     * 吸顶状态变化时触发：`stuck` 是否已吸住，`constrained` 是否已被容器底边推走
     * @en Emitted when the sticking state changes: `stuck` (pinned) and `constrained` (pushed away by the container bottom)
     */
    change: [state: { stuck: boolean, constrained: boolean }]
}>()

const root = ref<HTMLElement | null>(null)
const stuck = ref(false)
const constrained = ref(false)

/** 吸附判定的容差：亚像素取整与 1px 边框 */
const TOLERANCE = 1

/** 检测吸附边界时向上查找的层数上限（防止异常 DOM 造成死循环） */
const MAX_ANCESTOR_DEPTH = 50

/**
 * 最近的可滚动祖先（`overflow-y` 为 auto / scroll / overlay）；找不到时回退到 `window`。
 *
 * 「与滚动容器协作」的核心：吸顶元素位于内层滚动容器（如 Dialog 内容区 / 数据面板）时，
 * 必须监听那个容器的滚动，监听 `window` 只会得到「永不吸住」。
 */
function findScrollParent(node: HTMLElement | null): HTMLElement | Window {
    let current = node?.parentElement ?? null
    let depth = 0
    while (current && depth < MAX_ANCESTOR_DEPTH) {
        // 同时读计算值与内联值：部分环境（如无布局引擎的测试环境）计算值不反映内联样式
        const overflowY = current.style.overflowY || getComputedStyle(current).overflowY
        if (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') {
            return current
        }
        current = current.parentElement
        depth += 1
    }
    return window
}

/**
 * 滚动容器的**内容区顶边**（视口坐标）：吸顶位置相对内容区计算，而不是相对容器边框。
 * 容器的 `padding` / `border` 会把 sticky 的实际停靠点往下推，漏掉它们会让判定永远差几像素。
 */
function contentTop(element: HTMLElement): number {
    const rect = element.getBoundingClientRect()
    const paddingTop = Number.parseFloat(getComputedStyle(element).paddingTop)
    return rect.top + element.clientTop + (Number.isFinite(paddingTop) ? paddingTop : 0)
}

/** 按当前几何重算吸附状态；仅在状态真的变化时派发事件 */
function measure(): void {
    const element = root.value
    if (!element || props.disabled) {
        return
    }
    const rect = element.getBoundingClientRect()
    // 吸附判定基准 = 滚动容器的顶边（`window` 时为视口本身）。内层滚动容器离页面顶部有距离，
    // 直接用视口坐标会让「容器内已吸住」永远判不出来。
    const base = target instanceof HTMLElement ? contentTop(target) : 0
    const nextStuck = rect.top - base <= props.offset + TOLERANCE
    const parentRect = element.parentElement?.getBoundingClientRect()
    // 容器边界内吸附：吸住之后元素底边到达父容器底边，即被容器推着走（不再固定）。
    // 判据用「元素底边 ≥ 父底边」而不是「父底边 ≤ 偏移 + 高」——后者在 sticky 元素是滚动容器
    // 直接子节点时恒不成立（父底边就是容器底边，与滚动位置无关）。
    const nextConstrained = nextStuck
        && parentRect !== undefined
        && parentRect.bottom > 0
        && rect.bottom >= parentRect.bottom - TOLERANCE

    if (nextStuck === stuck.value && nextConstrained === constrained.value) {
        return
    }
    stuck.value = nextStuck
    constrained.value = nextConstrained
    emit('change', { stuck: nextStuck, constrained: nextConstrained })
}

let target: HTMLElement | Window | undefined

function bind(): void {
    unbind()
    if (props.disabled || !root.value) {
        return
    }
    target = findScrollParent(root.value)
    target.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })
    measure()
}

function unbind(): void {
    target?.removeEventListener('scroll', measure)
    target = undefined
    window.removeEventListener('resize', measure)
}

onMounted(bind)
onBeforeUnmount(unbind)

watch(() => props.disabled, (disabled) => {
    if (disabled) {
        stuck.value = false
        constrained.value = false
        unbind()
        return
    }
    bind()
})

watch(() => props.offset, measure)

/** 组件私有变量：层级由 prop 注入，缺省沿用基础层档位 */
const style = computed(() => ({
    '--caomei-sticky-offset': `${props.offset}px`,
    ...(props.zIndex === undefined ? {} : { '--caomei-sticky-z-index': String(props.zIndex) }),
}))
</script>

<template>
    <div
        v-bind="$attrs"
        ref="root"
        class="caomei-sticky"
        :class="{
            'caomei-sticky--stuck': stuck,
            'caomei-sticky--constrained': constrained,
            'caomei-sticky--disabled': disabled
        }"
        :style="style"
        :data-stuck="stuck || undefined"
        :data-constrained="constrained || undefined"
    >
        <slot />
    </div>
</template>

<style scoped>
/**
 * 吸顶依赖 CSS `position: sticky`：吸附范围由父容器（sticky 的包含块）天然限定，
 * 因此「容器边界内吸附」不需要 JS 参与，JS 只负责把状态暴露成 `data-stuck` /
 * `data-constrained` 供样式与消费方使用。
 */
.caomei-sticky {
    box-sizing: border-box;
    position: sticky;
    z-index: var(--caomei-sticky-z-index, var(--caomei-z-sticky));
    top: var(--caomei-sticky-offset, 0);
    background: var(--caomei-sticky-bg, var(--caomei-color-bg));
}

.caomei-sticky--stuck {
    box-shadow: var(--caomei-sticky-shadow, var(--caomei-shadow-sm));
}

.caomei-sticky--constrained {
    /* 到容器底边后不再强调吸住状态，避免视觉上误导「还固定着」 */
    box-shadow: none;
}

.caomei-sticky--disabled {
    position: static;
}
</style>
