<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { suppressOutside } from '../../_shared/open-state-inert'
import { useLocale } from '../../composables/use-locale'
import { CaomeiButton } from '../button'
import { lockScroll } from '../_shared/scroll-lock'
import {
    centerTourCard,
    computeTourPosition,
    computeTourSpotlight,
    TOUR_FALLBACK_CARD_SIZE,
} from './position'
import type {
    TourCardPosition,
    TourEmits,
    TourProps,
    TourRect,
    TourSize,
    TourSlotProps,
    TourStep,
} from './types'

defineOptions({ name: 'CaomeiTour', inheritAttrs: false })

const props = withDefaults(defineProps<TourProps>(), {
    placement: 'bottom',
    offset: 12,
    padding: 6,
    mask: true,
    closable: true,
    scrollIntoView: true,
})

const emit = defineEmits<TourEmits>()

defineSlots<{
    /** 自定义步骤内容；未提供时渲染 `step.description` */
    default?: (props: TourSlotProps) => unknown
}>()

/**
 * 挂载即打开：引导是一次性流程，缺省 `open = true`；
 * 需要延迟触发或后续再打开时用 `v-model:open` 控制。
 */
const open = defineModel<boolean>('open', { default: true })
const current = defineModel<number>('current', { default: 0 })

const messages = useLocale()
const tourMessages = computed(() => messages.value.tour)
/** 可访问名：显式 `label` 优先，否则取当前语言的内置文案 */
const accessibleLabel = computed(() => props.label ?? tourMessages.value.label)

const isClient = typeof window !== 'undefined'
const mounted = ref(false)
const overlayEl = ref<HTMLElement | null>(null)
const cardEl = ref<HTMLElement | null>(null)

const total = computed(() => props.steps.length)
/** 索引钳位：非有限数 / 小数按 0 / 截断处理，越界落到有效区间 */
const activeIndex = computed(() => {
    const raw = Number.isFinite(current.value) ? Math.trunc(current.value) : 0
    return Math.min(Math.max(raw, 0), Math.max(total.value - 1, 0))
})
const activeStep = computed<TourStep | undefined>(() => props.steps[activeIndex.value])
const isFirst = computed(() => activeIndex.value <= 0)
const isLast = computed(() => total.value > 0 && activeIndex.value >= total.value - 1)
/** 步骤项可能为空（含 `null` 断言外的脏数据），没有当前步骤时整层不渲染，避免「无卡片但锁页」 */
const visible = computed(() => mounted.value && open.value && activeStep.value !== undefined)

const targetRect = ref<TourRect | null>(null)
const viewport = ref<TourSize>({ width: 0, height: 0 })
const cardPosition = ref<TourCardPosition>({
    top: 0,
    left: 0,
    placement: props.placement,
})

/** 卡片实测尺寸：只在挂载 / 步骤切换 / 视口变化时读取，滚动重算沿用缓存（避免逐事件 layout 读取） */
let measuredCardSize: TourSize = { ...TOUR_FALLBACK_CARD_SIZE }
/** 打开前的焦点元素：关闭时归还，避免键盘用户被留在被卸载的浮层里 */
let restoreEl: HTMLElement | null = null
/** 本次激活的浮层根：关闭渲染后 `overlayEl` 已为空，焦点归还判断需要保留引用 */
let activeOverlay: HTMLElement | null = null
/** 关闭瞬间焦点是否仍在浮层内：浮层移除后无法再判断，须在移除前快照 */
let focusWasInside = true
/** 背景隔离的撤销句柄（`inert` / `aria-hidden` 由共享模块记账） */
let releaseIsolation: (() => void) | null = null
/** 模态形态的滚动锁撤销句柄 */
let releaseScrollLock: (() => void) | null = null

/** 解析步骤目标：元素直接用；函数取其返回值；选择器按浮层所属文档查找，非法选择器视为缺失 */
function resolveTarget(step: TourStep | undefined): HTMLElement | null {
    const target = step?.target
    if (!target) {
        return null
    }
    if (typeof target === 'function') {
        const resolved = target()
        return resolved instanceof HTMLElement ? resolved : null
    }
    if (typeof target === 'string') {
        const doc = activeOverlay?.ownerDocument ?? document
        try {
            return doc.querySelector<HTMLElement>(target)
        } catch {
            // 非法选择器按「目标缺失」降级，不中断引导
            return null
        }
    }
    return target
}

/** 读取卡片实测尺寸；未布局（0）时回退到默认尺寸，避免贴边计算失真 */
function measureCard(): void {
    const width = cardEl.value?.offsetWidth ?? 0
    const height = cardEl.value?.offsetHeight ?? 0
    measuredCardSize = {
        width: width > 0 ? width : TOUR_FALLBACK_CARD_SIZE.width,
        height: height > 0 ? height : TOUR_FALLBACK_CARD_SIZE.height,
    }
}

/** 重算目标矩形与卡片位置；滚动 / 尺寸变化 / 步骤切换统一走这里 */
function recompute(): void {
    if (!visible.value || !isClient) {
        return
    }
    viewport.value = { width: window.innerWidth, height: window.innerHeight }

    const element = resolveTarget(activeStep.value)
    if (element) {
        const rect = element.getBoundingClientRect()
        targetRect.value = { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
    } else {
        targetRect.value = null
    }

    const preferred = activeStep.value?.placement ?? props.placement
    const offset = activeStep.value?.offset ?? props.offset
    if (targetRect.value) {
        cardPosition.value = computeTourPosition(
            targetRect.value,
            viewport.value,
            measuredCardSize,
            preferred,
            offset,
        )
    } else {
        cardPosition.value = {
            ...centerTourCard(viewport.value, measuredCardSize),
            placement: preferred,
        }
    }
}

function scrollActiveIntoView(): void {
    if (!props.scrollIntoView) {
        return
    }
    const element = resolveTarget(activeStep.value)
    if (!element || typeof element.scrollIntoView !== 'function') {
        return
    }
    const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    try {
        element.scrollIntoView({ block: 'center', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
    } catch {
        // 不支持选项参数的环境退化为默认滚动
        element.scrollIntoView()
    }
}

function focusCard(): void {
    cardEl.value?.focus({ preventScroll: true })
}

/** Tab 焦点在卡片内循环：仅遮罩形态；非模态形态必须允许键盘离开（WCAG 2.1.2） */
function trapFocus(event: KeyboardEvent): void {
    const card = cardEl.value
    if (!card) {
        return
    }
    const focusable = [...card.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )]
    const active = card.ownerDocument.activeElement
    const outside = !card.contains(active) || active === card
    if (focusable.length === 0) {
        event.preventDefault()
        card.focus({ preventScroll: true })
        return
    }
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && (outside || active === first)) {
        event.preventDefault()
        last.focus()
        return
    }
    if (!event.shiftKey && (outside || active === last)) {
        event.preventDefault()
        first.focus()
    }
}

function startIsolation(): void {
    if (!props.mask || releaseIsolation) {
        return
    }
    const overlay = overlayEl.value
    if (overlay) {
        releaseIsolation = suppressOutside(overlay)
    }
}

function stopIsolation(): void {
    releaseIsolation?.()
    releaseIsolation = null
}

function startScrollLock(): void {
    if (!props.mask || releaseScrollLock) {
        return
    }
    releaseScrollLock = lockScroll()
}

function stopScrollLock(): void {
    releaseScrollLock?.()
    releaseScrollLock = null
}

function handleViewportChange(): void {
    measureCard()
    recompute()
}

function handleKeydown(event: KeyboardEvent): void {
    // 卡片内的嵌套浮层（下拉 / 气泡）已处理的按键不再由引导接管
    if (event.defaultPrevented) {
        return
    }
    if (event.key === 'Escape') {
        if (!props.closable) {
            return
        }
        event.preventDefault()
        skip()
        return
    }
    if (event.key === 'Tab' && props.mask) {
        trapFocus(event)
    }
}

/**
 * 快照「关闭瞬间焦点是否仍在浮层内」。
 *
 * 必须在浮层被移除**之前**调用：`flush: 'post'` 的关闭回调执行时 `v-if` 浮层已卸载，
 * 再读 `overlay.contains(activeElement)` 恒为假，守卫会形同虚设。
 */
function captureFocusOwnership(): void {
    focusWasInside = activeOverlay?.contains(document.activeElement) ?? false
}

/** 受控越界写回：显示索引与父级状态对齐，避免后续步骤扩张时突然跳步 */
function clampCurrent(): void {
    if (current.value !== activeIndex.value) {
        current.value = activeIndex.value
    }
}

function activate(): void {
    if (!isClient) {
        return
    }
    // 只记录真实的触发元素：`body` / 根元素没有可归还的焦点，记下反而会让关闭后焦点落到 body
    const activeAtOpen = document.activeElement
    focusWasInside = true
    restoreEl = activeAtOpen instanceof HTMLElement
        && activeAtOpen !== document.body
        && activeAtOpen !== document.documentElement
        ? activeAtOpen
        : null
    window.addEventListener('resize', handleViewportChange)
    // 捕获阶段监听：滚动目标可能是任意滚动容器，不冒泡到 document 的滚动事件同样需要重算
    document.addEventListener('scroll', recompute, { capture: true, passive: true })
    void nextTick(() => {
        if (!visible.value) {
            return
        }
        activeOverlay = overlayEl.value
        clampCurrent()
        startScrollLock()
        measureCard()
        scrollActiveIntoView()
        focusCard()
        recompute()
        startIsolation()
    })
}

function deactivate(): void {
    if (!isClient) {
        return
    }
    window.removeEventListener('resize', handleViewportChange)
    document.removeEventListener('scroll', recompute, { capture: true })
    stopScrollLock()
    stopIsolation()
    targetRect.value = null

    const target = restoreEl
    restoreEl = null
    activeOverlay = null
    if (!target?.isConnected) {
        return
    }
    // 消费者可能在 @finish / @skip 里把焦点移到自己的浮层：关闭前焦点已不在本层时不抢回
    const active = document.activeElement
    if (!focusWasInside && active && active !== document.body && active !== document.documentElement) {
        return
    }
    target.focus({ preventScroll: true })
}

function goNext(): void {
    const step = activeStep.value
    if (!step) {
        return
    }
    if (isLast.value) {
        finish()
        return
    }
    emit('next', step, activeIndex.value)
    current.value = activeIndex.value + 1
}

function goPrev(): void {
    const step = activeStep.value
    if (!step || isFirst.value) {
        return
    }
    emit('prev', step, activeIndex.value)
    current.value = activeIndex.value - 1
}

function skip(): void {
    const step = activeStep.value
    open.value = false
    if (step) {
        emit('skip', step, activeIndex.value)
    }
}

function finish(): void {
    const step = activeStep.value
    open.value = false
    if (step) {
        emit('finish', step, activeIndex.value)
    }
}

/** 挖空区与视口有交集时才用挖空式遮罩：目标远离视口时退回整屏遮罩，避免出现「无遮罩的模态」 */
const showSpotlight = computed(() => {
    const rect = targetRect.value
    if (!props.mask || !rect) {
        return false
    }
    const { width, height } = viewport.value
    return rect.top < height && rect.top + rect.height > 0 && rect.left < width && rect.left + rect.width > 0
})

const spotlightStyle = computed<Record<string, string> | undefined>(() => {
    const rect = targetRect.value
    if (!showSpotlight.value || !rect) {
        return undefined
    }
    const spot = computeTourSpotlight(rect, props.padding)
    return {
        top: `${spot.top}px`,
        left: `${spot.left}px`,
        width: `${spot.width}px`,
        height: `${spot.height}px`,
    }
})

const cardStyle = computed<Record<string, string>>(() => ({
    top: `${cardPosition.value.top}px`,
    left: `${cardPosition.value.left}px`,
}))

// 预刷新快照：先于本组件的渲染任务执行，此时浮层仍在 DOM 中
watch(visible, (value) => {
    if (!value) {
        captureFocusOwnership()
    }
}, { flush: 'pre' })

watch(visible, (value) => {
    if (value) {
        activate()
    } else {
        deactivate()
    }
}, { flush: 'post' })

watch(activeIndex, () => {
    if (!visible.value) {
        return
    }
    void nextTick(() => {
        if (!visible.value) {
            return
        }
        clampCurrent()
        measureCard()
        scrollActiveIntoView()
        focusCard()
        recompute()
    })
}, { flush: 'post' })

watch(() => props.mask, (mask) => {
    if (!visible.value) {
        return
    }
    if (mask) {
        startScrollLock()
        startIsolation()
    } else {
        stopScrollLock()
        stopIsolation()
    }
    void nextTick(() => {
        measureCard()
        recompute()
    })
})

watch(() => [props.placement, props.offset, props.padding], () => {
    if (visible.value) {
        recompute()
    }
})

/**
 * 深度监听：父级常用 `steps.value.push(...)` / 原地改写字段，
 * 只监听引用会让 `total` 与目标矩形脱节。
 */
watch(() => props.steps, () => {
    if (!visible.value) {
        return
    }
    void nextTick(() => {
        clampCurrent()
        measureCard()
        recompute()
    })
}, { deep: true })

onMounted(() => {
    mounted.value = true
})

onBeforeUnmount(() => {
    mounted.value = false
    // 卸载时浮层仍在 DOM 中，同样先快照再释放
    captureFocusOwnership()
    deactivate()
})
</script>

<template>
    <Teleport to="body">
        <div
            v-if="visible"
            ref="overlayEl"
            v-bind="$attrs"
            class="caomei-tour"
            :data-unmasked="mask ? undefined : 'true'"
            :role="mask ? 'dialog' : 'region'"
            :aria-modal="mask ? 'true' : undefined"
            :aria-label="accessibleLabel"
            :data-placement="cardPosition.placement"
            :data-step="activeIndex"
            :data-centered="targetRect ? undefined : 'true'"
            @keydown="handleKeydown"
        >
            <div
                v-if="mask && spotlightStyle"
                class="caomei-tour__spotlight"
                :style="spotlightStyle"
                aria-hidden="true"
            />
            <div
                v-else-if="mask"
                class="caomei-tour__mask"
                aria-hidden="true"
            />
            <div
                v-if="activeStep"
                ref="cardEl"
                class="caomei-tour__card"
                :style="cardStyle"
                role="group"
                :aria-label="activeStep.title || undefined"
                tabindex="-1"
            >
                <h2
                    v-if="activeStep.title"
                    class="caomei-tour__title"
                >
                    {{ activeStep.title }}
                </h2>
                <div class="caomei-tour__body">
                    <slot
                        :step="activeStep"
                        :index="activeIndex"
                        :total="total"
                    >
                        <p
                            v-if="activeStep.description"
                            class="caomei-tour__description"
                        >
                            {{ activeStep.description }}
                        </p>
                    </slot>
                </div>
                <footer class="caomei-tour__footer">
                    <span class="caomei-tour__progress">{{ activeIndex + 1 }} / {{ total }}</span>
                    <div class="caomei-tour__actions">
                        <CaomeiButton
                            v-if="closable"
                            variant="ghost"
                            size="sm"
                            @click="skip"
                        >
                            {{ tourMessages.skip }}
                        </CaomeiButton>
                        <CaomeiButton
                            variant="secondary"
                            size="sm"
                            :disabled="isFirst"
                            @click="goPrev"
                        >
                            {{ tourMessages.prev }}
                        </CaomeiButton>
                        <CaomeiButton
                            variant="primary"
                            size="sm"
                            @click="goNext"
                        >
                            {{ isLast ? tourMessages.finish : tourMessages.next }}
                        </CaomeiButton>
                    </div>
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<!--
  根节点经 Teleport 挂到 body：scoped 的 data-v 会落在浮层根而非卡片，
  因此遮罩 / 卡片样式统一用命名空间化的非 scoped 规则（同 Popover / DropdownMenu）。
-->
<style>
.caomei-tour {
    position: fixed;
    inset: 0;
    z-index: var(--caomei-tour-z-index, var(--caomei-z-toast));
    box-sizing: border-box;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

/*
  非遮罩形态：容器不拦截指针，页面保持可交互，只有卡片接住事件。
  遮罩形态下容器接收全部点击（背景不可交互），挖空区本身也不放行点击。
  用数据属性而非 BEM 修饰类表达该形态：它不是同一组件的静态变体，
  档位（`z-index`）必须继续只落在经 Teleport 挂载的浮层根上。
*/
.caomei-tour[data-unmasked='true'] {
    pointer-events: none;
}

.caomei-tour__mask {
    position: absolute;
    inset: 0;
    background: var(--caomei-tour-mask-bg, var(--caomei-color-mask));
}

/*
  挖空高亮：不给整屏铺底色，而由高亮块的超大 box-shadow 涂黑四周，
  这样圆角与高亮区始终逐帧对齐，不需要四块拼合的直角遮罩。
  目标远离视口时由组件退回 `.caomei-tour__mask`，不依赖该扩散半径。
*/
.caomei-tour__spotlight {
    position: absolute;
    box-sizing: border-box;
    border-radius: var(--caomei-tour-spotlight-radius, var(--caomei-radius-md));
    box-shadow: 0 0 0 100vmax var(--caomei-tour-mask-bg, var(--caomei-color-mask));
    pointer-events: none;
}

.caomei-tour__card {
    position: absolute;
    box-sizing: border-box;
    width: var(--caomei-tour-card-width, min(20rem, calc(100% - 2 * var(--caomei-space-4))));
    max-height: var(--caomei-tour-card-max-height, calc(100% - 2 * var(--caomei-space-4)));
    padding: var(--caomei-tour-card-padding, var(--caomei-space-4));
    overflow: auto;
    border: 1px solid var(--caomei-tour-card-border, var(--caomei-color-border));
    border-radius: var(--caomei-tour-card-radius, var(--caomei-radius-lg));
    background: var(--caomei-tour-card-bg, var(--caomei-color-bg-elevated));
    box-shadow: var(--caomei-shadow-lg);
    color: var(--caomei-color-text);
    outline: none;
    pointer-events: auto;
}

.caomei-tour__card:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-tour__title {
    margin: 0;
    color: var(--caomei-color-text);
    font-size: var(--caomei-font-size-lg);
    font-weight: 600;
    line-height: 1.3;
}

.caomei-tour__body {
    margin-top: var(--caomei-space-2);
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-md);
    line-height: 1.6;
}

.caomei-tour__description {
    margin: 0;
}

.caomei-tour__footer {
    display: flex;
    align-items: center;
    gap: var(--caomei-space-2);
    margin-top: var(--caomei-space-3);
}

.caomei-tour__progress {
    flex-shrink: 0;
    color: var(--caomei-color-text-muted);
    font-size: var(--caomei-font-size-sm);
    font-variant-numeric: tabular-nums;
}

.caomei-tour__actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--caomei-space-2);
    justify-content: flex-end;
    margin-left: auto;
}
</style>
