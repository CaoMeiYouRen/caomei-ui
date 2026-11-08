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
import { computed, useAttrs, watch, type Component } from 'vue'
import { createToastStore, provideToastStore, type ToastItem, type ToastTone } from '../../composables/use-toast'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import { resolveLabelName } from '../_shared/use-label-attrs'
import type { ToastProviderProps } from './types'

defineOptions({ name: 'CaomeiToastProvider', inheritAttrs: false })

const props = withDefaults(defineProps<ToastProviderProps>(), {
    position: 'top-right',
    duration: 5000,
    hotkey: () => ['F8'],
    max: 5,
    disableSwipe: false,
    swipeDirection: 'right',
    swipeThreshold: 50,
})

const store = createToastStore(props.max)
const { toasts } = store
provideToastStore(store)

const locale = useLocale()
const attrs = useAttrs()
const label = computed(() => resolveLabelName(props.label, undefined, locale.value.toast.label))
/** 视口 landmark 名优先级：显式 `viewportLabel` > 透传 `aria-label` > 语言兜底文案 */
const viewportLabel = computed(
    () => resolveLabelName(props.viewportLabel, attrs['aria-label'], locale.value.toast.viewport),
)
/** `aria-label` 已用于 landmark 命名，故不再随其余属性重复落到内层列表 */
const viewportAttrs = computed(() => {
    const { 'aria-label': _label, ...rest } = attrs
    return rest
})
const closeLabel = computed(() => locale.value.toast.close)

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

/**
 * 是否延后移除 Toast：`expressive` 且未开启 reduced-motion 时，先让 Reka Presence 播放退场动画，
 * 再由 `animationend` 移除；否则保持既有的「关闭即移除」行为（含 minimal / reduce）。
 */
function shouldDeferDismiss(): boolean {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
        return false
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return false
    }
    const sample = document.querySelector('.caomei-toast')
    if (!sample) {
        return false
    }
    // 与 CSS 选择器同源：任意祖先（含 html / 局部容器）的 expressive 轴都命中
    return sample.closest('[data-motion="expressive"]') !== null
}

function onOpenChange(id: string, open: boolean): void {
    if (open) {
        return
    }
    if (!shouldDeferDismiss()) {
        store.dismiss(id)
    }
}

function onAnimationEnd(id: string, event: AnimationEvent): void {
    if (!shouldDeferDismiss()) {
        return
    }
    if (event.animationName.includes('caomei-toast-out') || event.animationName.includes('caomei-toast-swipe-out')) {
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
            @animationend="(event: AnimationEvent) => onAnimationEnd(item.id, event)"
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
                :aria-label="closeLabel"
            >
                <CaomeiIcon :icon="X" />
            </ToastClose>
        </ToastRoot>
        <ToastViewport
            v-bind="viewportAttrs"
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
/*
  `--caomei-toast-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  语气选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-toast-viewport {
    position: fixed;
    z-index: var(--caomei-toast-z-index, var(--caomei-z-toast));
    display: flex;
    flex-direction: column;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    width: var(--caomei-toast-width, min(24rem, calc(100% - 2 * var(--caomei-toast-offset, var(--caomei-space-4)))));
    max-height: calc(100vh - 2 * var(--caomei-toast-offset, var(--caomei-space-4)));
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
    top: var(--caomei-toast-offset, var(--caomei-space-4));
    left: var(--caomei-toast-offset, var(--caomei-space-4));
    flex-direction: column-reverse;
}

.caomei-toast-viewport--top-center {
    top: var(--caomei-toast-offset, var(--caomei-space-4));
    left: 50%;
    flex-direction: column-reverse;
    transform: translateX(-50%);
}

.caomei-toast-viewport--top-right {
    top: var(--caomei-toast-offset, var(--caomei-space-4));
    right: var(--caomei-toast-offset, var(--caomei-space-4));
    flex-direction: column-reverse;
}

.caomei-toast-viewport--bottom-left {
    bottom: var(--caomei-toast-offset, var(--caomei-space-4));
    left: var(--caomei-toast-offset, var(--caomei-space-4));
}

.caomei-toast-viewport--bottom-center {
    bottom: var(--caomei-toast-offset, var(--caomei-space-4));
    left: 50%;
    transform: translateX(-50%);
}

.caomei-toast-viewport--bottom-right {
    right: var(--caomei-toast-offset, var(--caomei-space-4));
    bottom: var(--caomei-toast-offset, var(--caomei-space-4));
}

.caomei-toast {
    display: flex;
    align-items: flex-start;
    gap: var(--caomei-space-2);
    box-sizing: border-box;
    padding: var(--caomei-space-3);
    border: 1px solid var(--caomei-toast-tone-border, var(--caomei-color-border));
    border-left: 3px solid var(--caomei-toast-accent, var(--caomei-color-text-muted));
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-toast-tone-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-toast-tone-text, var(--caomei-color-text));
    box-shadow: var(--caomei-toast-tone-shadow, var(--caomei-shadow-md));
    pointer-events: auto;
}

/*
  逐语气覆盖钩子（`--caomei-toast-{tone}-{bg,border,text,shadow}`）：
  `:where()` 语气块只声明中间变量，基类以 `var(中间变量, 全局 token)` 消费——保持 0 特异性、
  不压过使用方的单类覆盖（下游 `.caomei-toast--success { background-color: … }` 仍生效）。
  未覆盖时逐属性解析到全局 token，与改动前逐值一致；`neutral` 不设专属钩子。

  作用域：`-text` 作用于根文本（标题及继承文本）；描述固定 `--caomei-color-text-muted`，
  操作按钮固定 `--caomei-color-primary-text`，两者不受本钩子控制。
  `-border` 只接受**颜色值**（作用于外框三边）；左侧强调条始终由 `--caomei-toast-accent` 控制。
*/
:where(.caomei-toast--primary) {
    --caomei-toast-accent: var(--caomei-color-primary);
    --caomei-toast-tone-bg: var(--caomei-toast-primary-bg, var(--caomei-color-bg-elevated));
    --caomei-toast-tone-border: var(--caomei-toast-primary-border, var(--caomei-color-border));
    --caomei-toast-tone-text: var(--caomei-toast-primary-text, var(--caomei-color-text));
    --caomei-toast-tone-shadow: var(--caomei-toast-primary-shadow, var(--caomei-shadow-md));
}

:where(.caomei-toast--success) {
    --caomei-toast-accent: var(--caomei-color-success);
    --caomei-toast-tone-bg: var(--caomei-toast-success-bg, var(--caomei-color-bg-elevated));
    --caomei-toast-tone-border: var(--caomei-toast-success-border, var(--caomei-color-border));
    --caomei-toast-tone-text: var(--caomei-toast-success-text, var(--caomei-color-text));
    --caomei-toast-tone-shadow: var(--caomei-toast-success-shadow, var(--caomei-shadow-md));
}

:where(.caomei-toast--warning) {
    --caomei-toast-accent: var(--caomei-color-warning);
    --caomei-toast-tone-bg: var(--caomei-toast-warning-bg, var(--caomei-color-bg-elevated));
    --caomei-toast-tone-border: var(--caomei-toast-warning-border, var(--caomei-color-border));
    --caomei-toast-tone-text: var(--caomei-toast-warning-text, var(--caomei-color-text));
    --caomei-toast-tone-shadow: var(--caomei-toast-warning-shadow, var(--caomei-shadow-md));
}

:where(.caomei-toast--danger) {
    --caomei-toast-accent: var(--caomei-color-danger);
    --caomei-toast-tone-bg: var(--caomei-toast-danger-bg, var(--caomei-color-bg-elevated));
    --caomei-toast-tone-border: var(--caomei-toast-danger-border, var(--caomei-color-border));
    --caomei-toast-tone-text: var(--caomei-toast-danger-text, var(--caomei-color-text));
    --caomei-toast-tone-shadow: var(--caomei-toast-danger-shadow, var(--caomei-shadow-md));
}

.caomei-toast[data-state='open'] {
    animation: caomei-toast-in var(--caomei-motion-duration-emphasis) var(--caomei-motion-ease-out);
}

.caomei-toast[data-swipe='move'] {
    transform: translate(var(--reka-toast-swipe-move-x, 0), var(--reka-toast-swipe-move-y, 0));
}

.caomei-toast[data-swipe='cancel'] {
    transform: translate(0, 0);
    transition: transform var(--caomei-motion-duration-slow) var(--caomei-motion-ease-out);
}

.caomei-toast[data-swipe='end'] {
    animation: caomei-toast-swipe-out var(--caomei-motion-duration-instant) var(--caomei-motion-ease-out) forwards;
}

.caomei-toast__icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
    color: var(--caomei-toast-accent, var(--caomei-color-text-muted));
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
    color: var(--caomei-color-primary-text);
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
        transform: translateY(-4px) scale(var(--caomei-toast-enter-scale, 1));
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
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

@keyframes caomei-toast-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    to {
        opacity: 0;
        transform: translateY(calc(-1 * var(--caomei-motion-distance-sm))) scale(var(--caomei-motion-scale-from));
    }
}

/* 动效优先模式：入场增加缩放；关闭（非滑动）在 Presence 保留 DOM 期间播放退场 */
:where([data-motion='expressive']) .caomei-toast {
    --caomei-toast-enter-scale: var(--caomei-motion-scale-from);
}

:where([data-motion='expressive']) .caomei-toast[data-state='closed']:where(:not([data-swipe='end'])) {
    animation: caomei-toast-out var(--caomei-motion-duration-fast) var(--caomei-motion-ease-out) forwards;
}

/* 减弱动效：入场 / 滑出 / 关闭退场动画与取消回弹过渡关闭（此前缺该兜底） */
@media (prefers-reduced-motion: reduce) {
    .caomei-toast[data-state='open'],
    .caomei-toast[data-state='closed'],
    .caomei-toast[data-swipe='end'] {
        animation: none;
    }

    .caomei-toast[data-swipe='cancel'] {
        transition: none;
    }
}
</style>
