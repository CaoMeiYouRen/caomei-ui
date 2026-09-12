<script setup lang="ts">
import { CircleCheck, CircleX, Info, TriangleAlert, X } from '@lucide/vue'
import {
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastRoot,
    ToastTitle,
    ToastViewport,
} from 'reka-ui'
import { computed, watch, type Component } from 'vue'
import { createToastStore, provideToastStore, type ToastItem, type ToastTone } from '../../composables/use-toast'
import { CaomeiIcon } from '../../icons'
import { defaultLocaleMessages } from '../../locale'
import type { ToastProviderProps } from './types'

defineOptions({ name: 'CaomeiToastProvider', inheritAttrs: false })

const props = withDefaults(defineProps<ToastProviderProps>(), {
    position: 'top-right',
    duration: 5000,
    label: defaultLocaleMessages.toast.label,
    viewportLabel: defaultLocaleMessages.toast.viewport,
    hotkey: () => ['F8'],
    max: 5,
    disableSwipe: false,
    swipeDirection: 'right',
    swipeThreshold: 50,
})

const store = createToastStore(props.max)
const { toasts } = store
provideToastStore(store)

watch(
    () => props.max,
    (next) => {
        store.setMax(next)
    },
)

const toneIcons: Record<ToastTone, Component> = {
    neutral: Info,
    primary: Info,
    success: CircleCheck,
    warning: TriangleAlert,
    danger: CircleX,
}

const viewportClass = computed(() => `caomei-toast-viewport--${props.position}`)

function toneClass(item: ToastItem): string {
    return `caomei-toast--${item.tone ?? 'neutral'}`
}

function toneIcon(item: ToastItem): Component {
    return toneIcons[item.tone ?? 'neutral']
}

function onOpenChange(id: string, open: boolean): void {
    if (!open) {
        store.dismiss(id)
    }
}
</script>

<template>
    <ToastProvider
        :label="label"
        :duration="duration"
        :disable-swipe="disableSwipe"
        :swipe-direction="swipeDirection"
        :swipe-threshold="swipeThreshold"
    >
        <slot />
        <ToastRoot
            v-for="item in toasts"
            :key="item.id"
            :type="item.type"
            :duration="item.duration"
            class="caomei-toast"
            :class="toneClass(item)"
            @update:open="(open: boolean) => onOpenChange(item.id, open)"
        >
            <span class="caomei-toast__icon" aria-hidden="true">
                <CaomeiIcon :icon="toneIcon(item)" />
            </span>
            <div class="caomei-toast__content">
                <ToastTitle v-if="item.title" class="caomei-toast__title">
                    {{ item.title }}
                </ToastTitle>
                <ToastDescription v-if="item.description" class="caomei-toast__description">
                    {{ item.description }}
                </ToastDescription>
            </div>
            <ToastAction
                v-if="item.action"
                class="caomei-toast__action"
                :alt-text="item.action.altText ?? item.action.label"
                @click="item.action.onClick?.()"
            >
                {{ item.action.label }}
            </ToastAction>
            <ToastClose
                v-if="item.closable !== false"
                class="caomei-toast__close"
                :aria-label="defaultLocaleMessages.toast.close"
            >
                <CaomeiIcon :icon="X" />
            </ToastClose>
        </ToastRoot>
        <ToastViewport
            v-bind="$attrs"
            class="caomei-toast-viewport"
            :class="viewportClass"
            :hotkey="hotkey"
            :label="viewportLabel"
        />
    </ToastProvider>
</template>

<!--
  ToastRoot 经 Teleport 注入 ToastViewport，跨组件根节点（Fragment + Teleport）导致 scoped
  的 data-v 无法稳定落到提示项本体；沿用 Select 面板的处理方式，改为 `caomei-*` 命名空间的
  非 scoped 规则，特异性低、便于使用方覆盖。
-->
<style>
.caomei-toast-viewport {
    --caomei-toast-offset: var(--caomei-space-4);
    --caomei-toast-width: min(24rem, calc(100% - 2 * var(--caomei-toast-offset)));
    --caomei-toast-z-index: 1100;

    position: fixed;
    z-index: var(--caomei-toast-z-index);
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    width: var(--caomei-toast-width);
    max-height: calc(100vh - 2 * var(--caomei-toast-offset));
    overflow-y: auto;
    font-family: var(--caomei-font-sans);
    pointer-events: none;
}

/*
  消费方/文档站的列表样式（如 `.vp-doc ol`，特异性 0,1,1）常会设置 margin / padding /
  list-style 并压过单类重置；这里用叠加类把重置提升到 0,2,0，保证视口几何不受宿主页影响。
*/
.caomei-toast-viewport.caomei-toast-viewport {
    margin: 0;
    padding: 0;
    list-style: none;
}

.caomei-toast-viewport--top-left {
    top: var(--caomei-toast-offset);
    left: var(--caomei-toast-offset);
    flex-direction: column-reverse;
}

.caomei-toast-viewport--top-center {
    top: var(--caomei-toast-offset);
    left: 50%;
    flex-direction: column-reverse;
    transform: translateX(-50%);
}

.caomei-toast-viewport--top-right {
    top: var(--caomei-toast-offset);
    right: var(--caomei-toast-offset);
    flex-direction: column-reverse;
}

.caomei-toast-viewport--bottom-left {
    bottom: var(--caomei-toast-offset);
    left: var(--caomei-toast-offset);
}

.caomei-toast-viewport--bottom-center {
    bottom: var(--caomei-toast-offset);
    left: 50%;
    transform: translateX(-50%);
}

.caomei-toast-viewport--bottom-right {
    right: var(--caomei-toast-offset);
    bottom: var(--caomei-toast-offset);
}

.caomei-toast {
    --caomei-toast-accent: var(--caomei-color-neutral-solid);

    display: flex;
    align-items: flex-start;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-color-border);
    border-left: 3px solid var(--caomei-toast-accent);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text);
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.12);
    pointer-events: auto;
}

.caomei-toast--primary {
    --caomei-toast-accent: var(--caomei-color-primary);
}

.caomei-toast--success {
    --caomei-toast-accent: var(--caomei-color-success);
}

.caomei-toast--warning {
    --caomei-toast-accent: var(--caomei-color-warning);
}

.caomei-toast--danger {
    --caomei-toast-accent: var(--caomei-color-danger);
}

.caomei-toast[data-state='open'] {
    animation: caomei-toast-in 0.18s ease-out;
}

.caomei-toast[data-swipe='move'] {
    transform: translate(var(--reka-toast-swipe-move-x, 0), var(--reka-toast-swipe-move-y, 0));
}

.caomei-toast[data-swipe='cancel'] {
    transform: translate(0, 0);
    transition: transform 0.2s ease-out;
}

.caomei-toast[data-swipe='end'] {
    animation: caomei-toast-swipe-out 0.1s ease-out forwards;
}

.caomei-toast__icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--caomei-toast-accent);
    font-size: var(--caomei-font-size-lg);
}

.caomei-toast__content {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--caomei-space-1);
    min-width: 0;
    font-size: var(--caomei-font-size-md);
}

.caomei-toast__title {
    font-weight: 600;
}

.caomei-toast__description {
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
}

.caomei-toast__action,
.caomei-toast__close {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    padding: var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-sm);
    background: transparent;
    color: var(--caomei-color-text-muted);
    font-family: inherit;
    font-size: var(--caomei-font-size-md);
    cursor: pointer;
}

.caomei-toast__action {
    font-weight: 600;
    color: var(--caomei-color-primary);
}

.caomei-toast__action:hover,
.caomei-toast__close:hover {
    color: var(--caomei-color-text);
}

.caomei-toast__action:focus-visible,
.caomei-toast__close:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

@keyframes caomei-toast-in {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes caomei-toast-swipe-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
        transform: translate(
            var(--reka-toast-swipe-end-x, 0),
            var(--reka-toast-swipe-end-y, 0)
        );
    }
}
</style>
