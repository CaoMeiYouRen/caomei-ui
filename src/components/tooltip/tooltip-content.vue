<script setup lang="ts">
import { TooltipContent, TooltipPortal } from 'reka-ui'
import type { TooltipContentProps } from './types'

defineOptions({ name: 'CaomeiTooltipContent', inheritAttrs: false })

withDefaults(defineProps<TooltipContentProps>(), {
    side: 'top',
    sideOffset: 6,
    align: 'center',
    alignOffset: 0,
    avoidCollisions: true,
    forceMount: false,
})
</script>

<template>
    <TooltipPortal>
        <TooltipContent
            v-bind="$attrs"
            :side="side"
            :side-offset="sideOffset"
            :align="align"
            :align-offset="alignOffset"
            :avoid-collisions="avoidCollisions"
            :force-mount="forceMount"
            :aria-label="ariaLabel"
            class="caomei-tooltip__content"
        >
            <slot />
        </TooltipContent>
    </TooltipPortal>
</template>

<!--
  Portal 面板样式说明：面板经 TooltipPortal 挂载到 body，scoped 的 data-v 属性
  落在 popper 包裹层而非面板本体，因此改用命名空间化的非 scoped 规则（同 Popover / DropdownMenu）。
  箭头同样位于 portal 内，样式一并集中于此。
-->
<style>
.caomei-tooltip__content {
    box-sizing: border-box;
    z-index: var(--caomei-tooltip-z-index, var(--caomei-z-tooltip));
    width: var(--caomei-tooltip-width, max-content);
    max-width: var(--caomei-tooltip-max-width, min(20rem, var(--reka-tooltip-content-available-width, 20rem)));
    padding: var(--caomei-tooltip-padding, var(--caomei-space-1) var(--caomei-space-2));
    border: 1px solid var(--caomei-tooltip-border, transparent);
    border-radius: var(--caomei-tooltip-radius, var(--caomei-radius-sm));
    background: var(--caomei-tooltip-bg, var(--caomei-color-neutral-solid));
    color: var(--caomei-tooltip-color, var(--caomei-color-on-solid));
    box-shadow: var(--caomei-tooltip-shadow, var(--caomei-shadow-sm));
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-tooltip-font-size, var(--caomei-font-size-sm));
    line-height: 1.5;
    text-align: start;
    text-wrap: pretty;
    outline: none;
    transform-origin: var(--reka-popper-transform-origin);
    animation: caomei-tooltip-in 0.1s ease-out;
}

.caomei-tooltip__arrow {
    fill: var(--caomei-tooltip-arrow-bg, var(--caomei-tooltip-bg, var(--caomei-color-neutral-solid)));
}

@keyframes caomei-tooltip-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-tooltip__content {
        animation: none;
    }
}
</style>
