<script setup lang="ts">
import { computed } from 'vue'
import { Passthrough } from '../_shared/passthrough'
import CaomeiTooltip from './tooltip.vue'
import CaomeiTooltipContent from './tooltip-content.vue'
import CaomeiTooltipTrigger from './tooltip-trigger.vue'

/**
 * 内部能力：给**单一子元素**（通常是本身没有可见文本的图标触发器）挂一条常显提示。
 *
 * 与 `CaomeiTooltipText` 的分工：后者面向「文本可能被截断」的可溢出元素并自带溢出检测，
 * 本组件面向 icon-only 触发器——没有可溢出文本，显示与否只由「是否有内容」和 `disabled` 决定。
 *
 * 未从包根导出；组件库内的图标触发器（Toolbar / Paginator 等）共用，避免每处重复一套
 * 「包装层切换 + 内容面板 + Provider 兜底」的接线。
 *
 * 只接受 `content` / `disabled` / `ignoreNonKeyboardFocus` 三个 prop：`inheritAttrs: false` 会丢弃
 * 其余属性，调用方不要指望在这里传 `class` / `style`（要定制外观请落在子元素上）。
 */
defineOptions({ name: 'CaomeiIconTooltip', inheritAttrs: false })

const props = withDefaults(defineProps<{
    /**
     * 提示内容；为空时不挂载提示接线
     * @en Tooltip content; when empty the tooltip wiring is not mounted at all
     */
    content?: string
    /**
     * 是否停用提示（子元素照常渲染）
     * @en Whether to disable the tooltip (the child still renders normally)
     */
    disabled?: boolean
    /**
     * 是否只在键盘触发（`:focus-visible`）时打开。
     *
     * 用于「会被程序化聚焦」的触发器（如 Dialog 打开时自动聚焦关闭按钮）：不开启时，
     * 打开对话框就会立刻弹出「关闭」提示。缺省不传，由 Provider 兜底。
     * @en Whether to open only for keyboard-initiated focus (`:focus-visible`). Used for triggers that receive programmatic focus (such as a dialog's close button on open): without it, opening the dialog immediately pops a "Close" tooltip. Omitted by default, falling back to the provider.
     */
    ignoreNonKeyboardFocus?: boolean
}>(), {
    content: '',
    disabled: false,
    ignoreNonKeyboardFocus: undefined,
})

const active = computed(() => !props.disabled && Boolean(props.content))

const RootWrapper = computed(() => (active.value ? CaomeiTooltip : Passthrough))
const TriggerWrapper = computed(() => (active.value ? CaomeiTooltipTrigger : Passthrough))
</script>

<template>
    <component
        :is="RootWrapper"
        :disabled="active ? undefined : true"
        :ignore-non-keyboard-focus="ignoreNonKeyboardFocus"
    >
        <component
            :is="TriggerWrapper"
            as-child
            unstyled
        >
            <slot />
        </component>
        <CaomeiTooltipContent v-if="active" :aria-label="content">
            {{ content }}
        </CaomeiTooltipContent>
    </component>
</template>
