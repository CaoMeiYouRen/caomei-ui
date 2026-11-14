<script setup lang="ts">
import { computed } from 'vue'
import { ToolbarButton } from 'reka-ui'
import CaomeiIconTooltip from '../tooltip/icon-tooltip.vue'
import { resolveIconTooltipContent } from '../tooltip/resolve-icon-tooltip'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarButtonProps } from './types'

defineOptions({ name: 'CaomeiToolbarButton', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarButtonProps>(), {
    disabled: false,
    label: '',
    tooltip: true,
})

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)

/**
 * 提示内容：图标工具条按钮通常只有图标，`label` 即其可访问名；未显式给内容且没有可访问名时
 * 不挂载提示，避免给纯文本按钮凭空加提示。
 */
const tooltipContent = computed(() => resolveIconTooltipContent(props.tooltip, {
    title: forwardedAttrs.value.title,
    name: props.label || forwardedAttrs.value['aria-label'],
}))

/** 启用提示后接管原生 title（其值已作为提示内容兜底），避免系统提示与内建提示双显 */
const rootAttrs = computed<Record<string, unknown>>(() => {
    const base = { ...forwardedAttrs.value }
    if (tooltipContent.value) {
        delete base.title
    }
    return base
})
</script>

<template>
    <CaomeiIconTooltip :content="tooltipContent">
        <ToolbarButton
            v-bind="rootAttrs"
            :disabled="disabled"
            class="caomei-toolbar__button"
        >
            <slot />
        </ToolbarButton>
    </CaomeiIconTooltip>
</template>
