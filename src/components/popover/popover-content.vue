<script setup lang="ts">
import { PopoverContent, PopoverPortal } from 'reka-ui'
import { inject, ref } from 'vue'
import { triggerElementKey } from '../_shared/trigger-element'
import { useOpenStateIsolation } from '../_shared/use-open-state-isolation'
import type { PopoverContentProps } from './types'

defineOptions({ name: 'CaomeiPopoverContent', inheritAttrs: false })

const contentRef = ref<{ $el?: unknown } | null>(null)
const triggerRef = inject(triggerElementKey, null)

const { release, sync } = useOpenStateIsolation(contentRef, () => [triggerRef?.value])

const props = withDefaults(defineProps<PopoverContentProps>(), {
    side: 'bottom',
    sideOffset: 8,
    align: 'center',
    alignOffset: 0,
    forceMount: false,
    avoidCollisions: true,
    disableOutsidePointerEvents: false,
})

/**
 * 锁定背景：Reka 的非模态 Popover 固定把 `disableOutsidePointerEvents` 置为 `false`
 * （面板外仍会触发 `pointerdown` / 聚焦并关闭），开启本配置时在此阻止外部关闭，
 * 使「背景交互不关闭浮层」的语义成立；`Escape` 与触发器切换不受影响。
 */
function onOutsideDismiss(event: Event): void {
    if (props.disableOutsidePointerEvents) {
        event.preventDefault()
    }
}
</script>

<template>
    <PopoverPortal>
        <PopoverContent
            ref="contentRef"
            v-bind="$attrs"
            :side="side"
            :side-offset="sideOffset"
            :align="align"
            :align-offset="alignOffset"
            :force-mount="forceMount"
            :avoid-collisions="avoidCollisions"
            :disable-outside-pointer-events="disableOutsidePointerEvents"
            class="caomei-popover__content"
            @open-auto-focus="sync"
            @close-auto-focus="release"
            @pointer-down-outside="onOutsideDismiss"
            @focus-outside="onOutsideDismiss"
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
    z-index: var(--caomei-popover-z-index, var(--caomei-z-dropdown));
    width: var(--caomei-popover-width, max-content);
    min-width: var(--caomei-popover-min-width, 12rem);
    max-width: var(--caomei-popover-max-width, min(20rem, var(--reka-popover-content-available-width)));
    max-height: var(--reka-popover-content-available-height);
    padding: var(--caomei-popover-padding, var(--caomei-space-3));
    overflow: auto;
    border: 1px solid var(--caomei-popover-border, var(--caomei-color-border));
    border-radius: var(--caomei-popover-radius, var(--caomei-radius-lg));
    background: var(--caomei-popover-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-color-text);
    box-shadow: var(--caomei-shadow-md);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
    outline: none;
    transform-origin: var(--reka-popover-content-transform-origin);
    animation: caomei-popover-in var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out);
}

.caomei-popover__arrow {
    fill: var(--caomei-popover-arrow-bg, var(--caomei-popover-bg, var(--caomei-color-bg-elevated)));
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
        transform: translateY(var(--caomei-popover-enter-y, 0)) scale(var(--caomei-popover-enter-scale, 0.96));
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes caomei-popover-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    to {
        opacity: 0;
        transform: translateY(var(--caomei-popover-enter-y, 0)) scale(var(--caomei-popover-enter-scale, 0.96));
    }
}

/* 动效优先模式：入场增加轻微位移；退场在 Presence 保留 DOM 期间播放 */
:where([data-motion='expressive']) .caomei-popover__content {
    --caomei-popover-enter-y: var(--caomei-motion-distance-sm);
    --caomei-popover-enter-scale: var(--caomei-motion-scale-from);
}

:where([data-motion='expressive']) .caomei-popover__content[data-state='closed'] {
    animation: caomei-popover-out var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out) forwards;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-popover__content,
    .caomei-popover__content[data-state='closed'] {
        animation: none;
    }
}
</style>
