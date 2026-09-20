<script setup lang="ts">
import { X } from '@lucide/vue'
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogOverlay,
    DialogPortal,
    DialogRoot,
    DialogTitle,
    DialogTrigger,
} from 'reka-ui'
import { computed } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { DrawerProps } from './types'

defineOptions({ name: 'CaomeiDrawer', inheritAttrs: false })

const props = withDefaults(defineProps<DrawerProps>(), {
    description: '',
    position: 'left',
    size: 'md',
    closable: true,
    closeOnOverlay: true,
    closeOnEsc: true,
    modal: true,
})

const open = defineModel<boolean>('open', { default: false })

defineSlots<{
    trigger?: () => unknown
    header?: () => unknown
    default?: () => unknown
    footer?: () => unknown
}>()

const locale = useLocale()
// 空串视为未提供，回退内建文案，避免产生空的可访问名
const closeLabel = computed(() => props.closeLabel || locale.value.drawer.close)
// 始终渲染 DialogTitle 以满足 Reka 的可访问名要求；自定义头部时标题转为视觉隐藏
const accessibleTitle = computed(() => props.title || locale.value.drawer.label)

const panelClass = computed(() => [
    `caomei-drawer__content--${props.position}`,
    `caomei-drawer__content--${props.size}`,
])

function onPointerDownOutside(event: Event): void {
    if (!props.closeOnOverlay) {
        event.preventDefault()
    }
}

function onEscapeKeyDown(event: KeyboardEvent): void {
    if (!props.closeOnEsc) {
        event.preventDefault()
    }
}
</script>

<template>
    <DialogRoot v-model:open="open" :modal="modal">
        <DialogTrigger v-if="$slots.trigger" as-child>
            <slot name="trigger" />
        </DialogTrigger>
        <DialogPortal>
            <DialogOverlay v-if="modal" class="caomei-drawer__overlay" />
            <DialogContent
                v-bind="$attrs"
                class="caomei-drawer__content"
                :class="panelClass"
                :data-position="position"
                :aria-modal="modal ? 'true' : undefined"
                @escape-key-down="onEscapeKeyDown"
                @pointer-down-outside="onPointerDownOutside"
            >
                <div class="caomei-drawer__header">
                    <div class="caomei-drawer__heading">
                        <DialogTitle
                            class="caomei-drawer__title"
                            :class="{'caomei-drawer__title--hidden': !title || $slots.header}"
                        >
                            {{ accessibleTitle }}
                        </DialogTitle>
                        <div v-if="$slots.header" class="caomei-drawer__header-slot">
                            <slot name="header" />
                        </div>
                        <DialogDescription class="caomei-drawer__description">
                            {{ description }}
                        </DialogDescription>
                    </div>
                    <DialogClose
                        v-if="closable"
                        class="caomei-drawer__close"
                        :aria-label="closeLabel"
                    >
                        <CaomeiIcon :icon="X" />
                    </DialogClose>
                </div>
                <div class="caomei-drawer__body">
                    <slot />
                </div>
                <div v-if="$slots.footer" class="caomei-drawer__footer">
                    <slot name="footer" />
                </div>
            </DialogContent>
        </DialogPortal>
    </DialogRoot>
</template>

<style scoped>
/*
  `--caomei-drawer-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-drawer__overlay {
    position: fixed;
    z-index: var(--caomei-z-overlay);
    inset: 0;
    background: var(--caomei-color-mask);
}

.caomei-drawer__content {
    position: fixed;
    z-index: var(--caomei-z-modal);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-3);
    padding: var(--caomei-space-4);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    box-shadow: var(--caomei-shadow-lg);
}

:where(.caomei-drawer__content--sm) {
    --caomei-drawer-size: 320px;
}

:where(.caomei-drawer__content--md) {
    --caomei-drawer-size: 420px;
}

:where(.caomei-drawer__content--lg) {
    --caomei-drawer-size: 560px;
}

.caomei-drawer__content--left,
.caomei-drawer__content--right {
    top: 0;
    bottom: 0;
    width: min(90vw, var(--caomei-drawer-size, 420px));
}

.caomei-drawer__content--right {
    right: 0;
}

.caomei-drawer__content--left {
    left: 0;
}

.caomei-drawer__content--top,
.caomei-drawer__content--bottom {
    right: 0;
    left: 0;
    height: min(90vh, var(--caomei-drawer-size, 420px));
}

.caomei-drawer__content--top {
    top: 0;
}

.caomei-drawer__content--bottom {
    bottom: 0;
}

.caomei-drawer__header {
    display: flex;
    flex-shrink: 0;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--caomei-space-2);
}

.caomei-drawer__heading {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
}

.caomei-drawer__title {
    margin: 0;
    font-size: var(--caomei-font-size-lg);
    font-weight: 600;
}

/* 自定义头部时保留可访问名但不重复展示标题文本 */
.caomei-drawer__title--hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    padding: 0;
    border: 0;
    margin: -1px;
    clip-path: inset(50%);
    white-space: nowrap;
}

.caomei-drawer__description {
    margin: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-drawer__body {
    flex: 1;
    min-height: 0;
    overflow: auto;
    font-size: var(--caomei-font-size-md);
}

.caomei-drawer__footer {
    display: flex;
    flex-shrink: 0;
    justify-content: flex-end;
    gap: var(--caomei-space-2);
}

.caomei-drawer__close {
    display: inline-flex;
    flex-shrink: 0;
    padding: var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    cursor: pointer;
}

.caomei-drawer__close:hover {
    color: var(--caomei-color-text);
}

.caomei-drawer__close:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

@keyframes caomei-drawer-fade-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes caomei-drawer-fade-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes caomei-drawer-in-right {
    from {
        transform: translateX(100%);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes caomei-drawer-out-right {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(100%);
    }
}

@keyframes caomei-drawer-in-left {
    from {
        transform: translateX(-100%);
    }

    to {
        transform: translateX(0);
    }
}

@keyframes caomei-drawer-out-left {
    from {
        transform: translateX(0);
    }

    to {
        transform: translateX(-100%);
    }
}

@keyframes caomei-drawer-in-top {
    from {
        transform: translateY(-100%);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes caomei-drawer-out-top {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(-100%);
    }
}

@keyframes caomei-drawer-in-bottom {
    from {
        transform: translateY(100%);
    }

    to {
        transform: translateY(0);
    }
}

@keyframes caomei-drawer-out-bottom {
    from {
        transform: translateY(0);
    }

    to {
        transform: translateY(100%);
    }
}

.caomei-drawer__overlay[data-state='open'] {
    animation: caomei-drawer-fade-in var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__overlay[data-state='closed'] {
    animation: caomei-drawer-fade-out var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--right[data-state='open'] {
    animation: caomei-drawer-in-right var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--right[data-state='closed'] {
    animation: caomei-drawer-out-right var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--left[data-state='open'] {
    animation: caomei-drawer-in-left var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--left[data-state='closed'] {
    animation: caomei-drawer-out-left var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--top[data-state='open'] {
    animation: caomei-drawer-in-top var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--top[data-state='closed'] {
    animation: caomei-drawer-out-top var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--bottom[data-state='open'] {
    animation: caomei-drawer-in-bottom var(--caomei-drawer-duration, 200ms) ease;
}

.caomei-drawer__content--bottom[data-state='closed'] {
    animation: caomei-drawer-out-bottom var(--caomei-drawer-duration, 200ms) ease;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-drawer__overlay,
    .caomei-drawer__content {
        animation: none;
    }
}
</style>
