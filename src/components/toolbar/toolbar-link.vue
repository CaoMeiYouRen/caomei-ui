<script setup lang="ts">
import { computed } from 'vue'
import { ToolbarLink } from 'reka-ui'
import CaomeiIconTooltip from '../tooltip/icon-tooltip.vue'
import { resolveIconTooltipContent } from '../tooltip/resolve-icon-tooltip'
import { useLabelAttrs } from '../_shared/use-label-attrs'
import type { ToolbarLinkProps } from './types'

defineOptions({ name: 'CaomeiToolbarLink', inheritAttrs: false })

const props = withDefaults(defineProps<ToolbarLinkProps>(), {
    label: '',
    tooltip: true,
})

/** label 属性优先于透传的 aria-label；二者都缺省时由可见文本推导可访问名 */
const forwardedAttrs = useLabelAttrs(() => props.label)

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
        <ToolbarLink
            v-bind="rootAttrs"
            class="caomei-toolbar__link"
        >
            <slot />
        </ToolbarLink>
    </CaomeiIconTooltip>
</template>

<style scoped>
.caomei-toolbar__link {
    box-sizing: border-box;
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    gap: var(--caomei-toolbar-button-gap, var(--caomei-space-1));
    height: var(--caomei-toolbar-button-size, var(--caomei-control-height-md));
    padding: 0 var(--caomei-toolbar-button-padding-x, var(--caomei-space-2));
    border-radius: var(--caomei-toolbar-button-radius, var(--caomei-radius-sm));
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-md);
    text-decoration: none;
    white-space: nowrap;
    transition: background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard), color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-toolbar__link:hover {
    background: var(--caomei-color-bg-elevated);
}

.caomei-toolbar__link:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-toolbar__link {
        transition: none;
    }
}
</style>
