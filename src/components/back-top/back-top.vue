<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import type { BackTopEmits, BackTopProps, BackTopSlotProps } from './types'

defineOptions({ name: 'CaomeiBackTop' })

const props = withDefaults(defineProps<BackTopProps>(), {
    target: undefined,
    threshold: 200,
})

const emit = defineEmits<BackTopEmits>()

const icons = useInternalIcons()
const messages = useLocale()

/** 可访问名：显式 `label` 优先，否则取当前语言的内置文案。 */
const accessibleLabel = computed(() => props.label ?? messages.value.backTop.label)

/** 已解析的滚动目标；挂载后才存在（SSR 期间不触碰 `document` / `window`）。 */
const scrollTarget = ref<HTMLElement | Window | null>(null)
const visible = ref(false)

/** 解析滚动目标：元素直接用，字符串按选择器查，其余（含非法选择器 / 空值）回退 `window`。 */
function resolveTarget(): HTMLElement | Window {
    if (props.target instanceof HTMLElement) {
        return props.target
    }
    if (typeof props.target === 'string' && props.target) {
        try {
            return document.querySelector<HTMLElement>(props.target) ?? window
        } catch {
            // 非法选择器（如数字开头的 id 拼出的 `#123-panel`）回退窗口滚动，不中断挂载
            return window
        }
    }
    return window
}

function readOffset(target: HTMLElement | Window): number {
    // 用引用比较而不是 `instanceof Window`：跨 realm / 测试环境（happy-dom）下构造函数不同源
    if (target === (window as unknown)) {
        return window.scrollY
    }
    return (target as HTMLElement).scrollTop
}

function handleScroll(): void {
    const target = scrollTarget.value
    if (!target) {
        return
    }
    visible.value = readOffset(target) > props.threshold
}

function attach(): void {
    detach()
    scrollTarget.value = resolveTarget()
    scrollTarget.value.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
}

function detach(): void {
    scrollTarget.value?.removeEventListener('scroll', handleScroll)
    scrollTarget.value = null
}

onMounted(attach)

onBeforeUnmount(detach)

watch(() => props.target, () => {
    attach()
}, { flush: 'post' })

watch(() => props.threshold, handleScroll)

/**
 * 回顶：尊重 `prefers-reduced-motion`——系统要求减少动效时用 `auto`（瞬时跳转），
 * 其余情况用 `smooth`。两种取值都走原生滚动 API，不额外引入 rAF 循环。
 */
function scrollToTop(event: MouseEvent): void {
    const target = scrollTarget.value
    if (!target) {
        return
    }
    const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = reduceMotion ? 'auto' : 'smooth'
    if (target === (window as unknown)) {
        window.scrollTo({ top: 0, behavior })
    } else {
        (target as HTMLElement).scrollTo({ top: 0, behavior })
    }
    emit('click', event)
}

defineSlots<{
    /** 自定义按钮内容（图标 / 文本） */
    default?: (props: BackTopSlotProps) => unknown
}>()
</script>

<template>
    <button
        v-show="visible"
        type="button"
        class="caomei-back-top"
        :aria-label="accessibleLabel"
        @click="scrollToTop"
    >
        <slot :visible="visible">
            <CaomeiIcon
                :icon="icons.chevronUp"
                aria-hidden="true"
            />
        </slot>
    </button>
</template>

<style scoped>
/*
  回顶按钮：固定定位在右下角，偏移与尺寸走 CSS 变量，便于消费方整体替换。
  不使用 `z-index` 字面量，取浮层词表的 `sticky` 档（低于任何模态 / 浮层）。
*/

/*
  右下偏移叠加同侧安全区 token：横屏圆角与底部 home indicator 下按钮仍需可点。
  token 默认 `env(safe-area-inset-*, 0px)`，桌面为 0px，未声明安全区时逐值等同原偏移。
*/
.caomei-back-top {
    position: fixed;
    right: calc(var(--caomei-back-top-right, var(--caomei-space-4)) + var(--caomei-safe-area-right, 0px));
    bottom: calc(var(--caomei-back-top-bottom, var(--caomei-space-4)) + var(--caomei-safe-area-bottom, 0px));
    z-index: var(--caomei-back-top-z-index, var(--caomei-z-sticky));
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: var(--caomei-back-top-size, 2.5rem);
    height: var(--caomei-back-top-size, 2.5rem);
    padding: 0;
    border: 1px solid var(--caomei-back-top-border, var(--caomei-color-border));
    border-radius: var(--caomei-back-top-radius, var(--caomei-radius-full));
    background: var(--caomei-back-top-bg, var(--caomei-color-bg-elevated));
    color: var(--caomei-back-top-color, var(--caomei-color-text));
    box-shadow: var(--caomei-back-top-shadow, var(--caomei-shadow-sm));
    cursor: pointer;
}

.caomei-back-top:hover {
    color: var(--caomei-color-primary-text);
}

.caomei-back-top:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
