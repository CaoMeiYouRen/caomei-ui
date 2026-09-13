<script setup lang="ts">
import { PopoverContent, PopoverPortal } from 'reka-ui'
import type { PopoverContentProps } from './types'

defineOptions({ name: 'CaomeiPopoverContent', inheritAttrs: false })

withDefaults(defineProps<PopoverContentProps>(), {
    side: 'bottom',
    sideOffset: 8,
    align: 'center',
    alignOffset: 0,
    forceMount: false,
    avoidCollisions: true,
    disableOutsidePointerEvents: false,
})
</script>

<template>
    <PopoverPortal>
        <PopoverContent
            v-bind="$attrs"
            :side="side"
            :side-offset="sideOffset"
            :align="align"
            :align-offset="alignOffset"
            :force-mount="forceMount"
            :avoid-collisions="avoidCollisions"
            :disable-outside-pointer-events="disableOutsidePointerEvents"
            class="caomei-popover__content"
        >
            <slot />
        </PopoverContent>
    </PopoverPortal>
</template>

<!--
  Portal 面板样式说明：面板经 PopoverPortal 挂载到 body，scoped 的 data-v 属性
  落在 popper 包裹层而非面板本体，因此改用命名空间化的非 scoped 规则（同 Select / DropdownMenu）。
  箭头与关闭按钮同样位于 portal 内，样式一并集中于此。
-->
<style>
.caomei-popover__content {
    box-sizing: border-box;
    z-index: var(--caomei-popover-z-index, 1050);
    width: var(--caomei-popover-width, max-content);
    min-width: var(--caomei-popover-min-width, 12rem);
    max-width: var(--caomei-popover-max-width, min(20rem, var(--reka-popover-content-available-width)));
    max-height: var(--reka-popover-content-available-height);
    padding: var(--caomei-popover-padding, var(--caomei-space-3));
    overflow: auto;
    border: 1px solid var(--caomei-popover-border, var(--caomei-color-border));
    border-radius: var(--caomei-popover-radius, var(--caomei-radius-md));
    background: var(--caomei-popover-bg, var(--caomei-color-bg));
    color: var(--caomei-color-text);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-popover-content-transform-origin);
    animation: caomei-popover-in 0.12s ease-out;
}

.caomei-popover__arrow {
    fill: var(--caomei-popover-arrow-bg, var(--caomei-popover-bg, var(--caomei-color-bg)));
}

.caomei-popover__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-popover__close:hover {
    color: var(--caomei-color-text);
}

.caomei-popover__close:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

@keyframes caomei-popover-in {
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
    .caomei-popover__content {
        animation: none;
    }
}
</style>
