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
 * 只接受 `content` / `disabled` 两个 prop：`inheritAttrs: false` 会丢弃其余属性，调用方不要
 * 指望在这里传 `class` / `style`（要定制外观请落在子元素上）。
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
}>(), {
    content: '',
    disabled: false,
})

const active = computed(() => !props.disabled && Boolean(props.content))

const RootWrapper = computed(() => (active.value ? CaomeiTooltip : Passthrough))
const TriggerWrapper = computed(() => (active.value ? CaomeiTooltipTrigger : Passthrough))
</script>

<template>
    <component
        :is="RootWrapper"
        :disabled="active ? undefined : true"
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
