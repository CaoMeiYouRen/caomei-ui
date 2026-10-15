<script setup lang="ts">
import { TooltipTrigger } from 'reka-ui'
import type { TooltipTriggerProps } from './types'

defineOptions({ name: 'CaomeiTooltipTrigger', inheritAttrs: false })

const props = withDefaults(defineProps<TooltipTriggerProps>(), {
    unstyled: false,
})
</script>

<template>
    <TooltipTrigger
        v-bind="$attrs"
        :class="props.unstyled ? undefined : 'caomei-tooltip__trigger'"
    >
        <slot />
    </TooltipTrigger>
</template>

<style scoped>
/*
  触发器为「无外观接线层」：只把元素复位成可点击的内联容器（浏览器默认的 button 外观会被
  带入页面），交互与无障碍属性由 Reka 承载。包在自定义控件上时用 `as-child` + `unstyled`，
  避免这里的复位规则与子元素自身的 padding / border / background 竞争。
  面板的可见性由 aria-describedby 关联，不依赖视觉样式。
*/
.caomei-tooltip__trigger {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    gap: var(--caomei-tooltip-trigger-gap, var(--caomei-space-1));
    padding: var(--caomei-tooltip-trigger-padding, 0);
    border: 0;
    border-radius: var(--caomei-tooltip-trigger-radius, var(--caomei-radius-sm));
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: inherit;
    cursor: pointer;
}

.caomei-tooltip__trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
