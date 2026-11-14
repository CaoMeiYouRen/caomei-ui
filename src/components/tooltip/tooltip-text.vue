<script setup lang="ts">
import { computed, defineComponent, ref, watch, type VNodeChild } from 'vue'
import { useOverflowTooltip } from '../../composables/use-overflow-tooltip'
import CaomeiTooltip from './tooltip.vue'
import CaomeiTooltipContent from './tooltip-content.vue'
import CaomeiTooltipTrigger from './tooltip-trigger.vue'
import type { TooltipTextProps } from './types'

defineOptions({ name: 'CaomeiTooltipText', inheritAttrs: false })

const props = withDefaults(defineProps<TooltipTextProps>(), {
    content: undefined,
    mode: 'auto',
    disabled: false,
})

const target = ref<HTMLElement | null>(null)
const visibleText = ref('')
const open = ref(false)

/**
 * 溢出检测：`auto` 模式下只在文本装不下时启用提示；`always` 模式不需要测量，但仍借
 * `onMeasure` 同步可见文本，作为「未显式给 `content`」时的提示内容。
 */
const { overflowing } = useOverflowTooltip(target, {
    disabled: () => props.disabled,
    onMeasure: () => {
        visibleText.value = normalize(target.value?.textContent)
    },
})

function normalize(text: string | null | undefined): string {
    return text?.replace(/\s+/gu, ' ').trim() ?? ''
}

const tooltipText = computed(() => props.content || visibleText.value)

/** 是否真的启用提示：`disabled` 一律不启用；`always` 直接启用，`auto` 仅在文本溢出时启用 */
const active = computed(() => !props.disabled
    && (props.mode === 'always' || overflowing.value)
    && Boolean(tooltipText.value))

/** 是否挂载提示接线。只看 `disabled` 而不看活跃度：活跃度会随溢出翻转，切换包装层会重建元素 */
const wired = computed(() => !props.disabled)

// 文本从截断变为完整（或内容被清空）时，已打开的面板必须收起——`disabled` 只拦打开、不关已开的。
watch(active, (value) => {
    if (!value) {
        open.value = false
    }
})

/** 无提示时的透传层：不渲染 DOM，保证根始终是承载文本的单一元素 */
const Passthrough = defineComponent({
    name: 'CaomeiTooltipTextPassthrough',
    inheritAttrs: false,
    setup(_, { slots }): () => VNodeChild {
        return () => slots.default?.()
    },
})

const RootWrapper = computed(() => (wired.value ? CaomeiTooltip : Passthrough))
const TriggerWrapper = computed(() => (wired.value ? CaomeiTooltipTrigger : Passthrough))

function setTarget(element: unknown): void {
    target.value = element instanceof HTMLElement ? element : null
}
</script>

<template>
    <component
        :is="RootWrapper"
        v-model:open="open"
        :disabled="active ? undefined : true"
    >
        <component
            :is="TriggerWrapper"
            as-child
            unstyled
        >
            <span
                :ref="setTarget"
                v-bind="$attrs"
                class="caomei-tooltip-text"
            ><slot>{{ content }}</slot></span>
        </component>
        <CaomeiTooltipContent v-if="active" :aria-label="tooltipText">
            {{ tooltipText }}
        </CaomeiTooltipContent>
    </component>
</template>

<style scoped>
/*
  只承担「提示接线」与截断检测的共同前提：**可测量的盒子**。

  溢出判据依赖 `scrollWidth` / `clientWidth`，而这两个读数对 `display: inline` 的非替换元素恒为 0
  ——根元素若保持行内形态，`mode="auto"` 在真实浏览器里永不触发（单测桩驱动无法暴露）。故显式建立
  `inline-block` 盒（在 flex / grid 中会被块化为 `block`，同样可测），并由 `max-width: 100%` 允许
  被父容器压缩。

  是否截断（`nowrap` + 定宽 / `max-width` + `ellipsis`）仍由使用方决定——组件不替宿主决定文本如何
  布局，否则会把「按内容撑开」的元素静默改成单行裁切。

  选择器用 `:where()` 归零特异性：这里的 `display` / `max-width` 是「默认形态」，使用方的截断配方
  （如 `max-width: 120px`）必须能直接覆盖，否则会把消费者限定的宽度静默改回 `100%`、溢出永不成立。
*/
:where(.caomei-tooltip-text) {
    box-sizing: border-box;
    display: inline-block;
    max-width: 100%;
    min-width: 0;
}
</style>
