<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import type { AnchorItem, AnchorProps, AnchorSlotProps } from './types'

defineOptions({ name: 'CaomeiAnchor' })

const props = withDefaults(defineProps<AnchorProps>(), {
    container: undefined,
    offset: 12,
    smooth: true,
    hashSync: true,
    label: undefined,
})

const messages = useLocale()
const accessibleLabel = computed(() => props.label ?? messages.value.anchor.label)

/** 受控激活项：点击与 scroll-spy 都写回该模型 */
const active = defineModel<string>('active', { default: '' })

const rootEl = ref<HTMLElement | null>(null)
const scrollTarget = ref<HTMLElement | Window | null>(null)
let headings = new Map<string, HTMLElement>()
let frame: number | null = null

/** 深度优先展开为「条目 + 深度」序列，供渲染与激活计算共用 */
function flatten(items: AnchorItem[], depth = 0): { item: AnchorItem, depth: number }[] {
    return items.flatMap((item) => [
        { item, depth },
        ...(item.children ? flatten(item.children, depth + 1) : []),
    ])
}

const flatItems = computed(() => flatten(props.items))

function targetId(item: AnchorItem): string {
    return item.id ?? item.key
}

function resolveContainer(): HTMLElement | Window {
    if (props.container instanceof HTMLElement) {
        return props.container
    }
    if (typeof props.container === 'string' && props.container) {
        try {
            return document.querySelector<HTMLElement>(props.container) ?? window
        } catch {
            return window
        }
    }
    return window
}

function targetTop(target: HTMLElement | Window): number {
    if (target === (window as unknown)) {
        return 0
    }
    return (target as HTMLElement).getBoundingClientRect().top
}

/**
 * 计算激活项：取「顶部越过判定线」的最后一个标题；都不满足时取第一个。
 * 判定线 = 容器顶 + `offset`（元素相对视口，因此用元素与容器的 rect 差比较）。
 */
function computeActive(): string | undefined {
    const target = scrollTarget.value
    if (!target || flatItems.value.length === 0) {
        return undefined
    }
    // 内容可能异步挂载（SPA 路由切换 / 懒加载）：仅在映射缺失时补解析，避免每帧全量重建
    if (flatItems.value.some(({ item }) => !headings.has(targetId(item)))) {
        resolveHeadings()
    }
    const line = targetTop(target) + props.offset
    let current: string | undefined
    let firstResolved: string | undefined
    let resolved = 0
    for (const { item } of flatItems.value) {
        const element = headings.get(targetId(item))
        if (!element) {
            continue
        }
        resolved += 1
        firstResolved ??= item.key
        const top = element.getBoundingClientRect().top
        if (top <= line) {
            current = item.key
            continue
        }
        break
    }
    // 所有目标都未渲染（如文档尚未挂载）时不覆盖受控值
    if (resolved === 0) {
        return undefined
    }
    return current ?? firstResolved
}

function syncActive(): void {
    const next = computeActive()
    if (next !== undefined && next !== active.value) {
        active.value = next
    }
}

function onScroll(): void {
    // rAF 合并：滚动事件密集时每帧只算一次
    if (frame !== null) {
        return
    }
    const raf: (callback: FrameRequestCallback) => number = typeof requestAnimationFrame === 'function'
        ? requestAnimationFrame
        : (callback: FrameRequestCallback): number => setTimeout(() => {
                callback(Date.now())
            }, 16) as unknown as number
    frame = raf(() => {
        frame = null
        syncActive()
    })
}

function resolveHeadings(): void {
    headings = new Map()
    const root = rootEl.value?.ownerDocument ?? document
    for (const { item } of flatItems.value) {
        const element = root.getElementById(targetId(item))
        if (element) {
            headings.set(targetId(item), element)
        }
    }
}

/** 点击滚动：以「判定线」为落点，容器场景只滚容器，避免连带滚动页面 */
function scrollToItem(item: AnchorItem): void {
    const element = headings.get(targetId(item))
    const target = scrollTarget.value
    if (!element || !target) {
        return
    }
    const reduceMotion = typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const behavior: ScrollBehavior = props.smooth && !reduceMotion ? 'smooth' : 'auto'
    if (target === (window as unknown)) {
        const top = element.getBoundingClientRect().top + window.scrollY - props.offset
        window.scrollTo({ top, behavior })
        return
    }
    const scroller = target as HTMLElement
    const delta = element.getBoundingClientRect().top - scroller.getBoundingClientRect().top - props.offset
    scroller.scrollTo({ top: scroller.scrollTop + delta, behavior })
}

function updateHash(item: AnchorItem): void {
    if (!props.hashSync || typeof history === 'undefined') {
        return
    }
    const id = targetId(item)
    let currentHash = ''
    try {
        currentHash = decodeURIComponent(window.location.hash)
    } catch {
        currentHash = window.location.hash
    }
    if (currentHash === `#${id}`) {
        return
    }
    try {
        // 与原生锚点一致：入栈，浏览器「后退」可回到上一节。
        // hash 模式路由宿主请设 `hashSync = false`（组件文档有说明）。
        history.pushState(null, '', `#${id}`)
    } catch {
        // sandboxed iframe / file:// 下可能抛 SecurityError：不影响高亮与滚动
        window.location.hash = `#${id}`
    }
}

function onClick(event: MouseEvent, item: AnchorItem): void {
    // 修饰键点击（新标签 / 新窗口）交给浏览器；目标未解析时保留原生锚点行为
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
        return
    }
    if (!headings.get(targetId(item))) {
        active.value = item.key
        return
    }
    event.preventDefault()
    if (frame !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frame)
        frame = null
    }
    active.value = item.key
    updateHash(item)
    scrollToItem(item)
}

function onHashChange(): void {
    if (!props.hashSync) {
        return
    }
    let id = ''
    try {
        id = decodeURIComponent(window.location.hash.replace(/^#/, ''))
    } catch {
        return
    }
    if (!id) {
        return
    }
    const matched = flatItems.value.find(({ item }) => targetId(item) === id)
    if (matched) {
        active.value = matched.item.key
        scrollToItem(matched.item)
    }
}

function attach(): void {
    detach()
    scrollTarget.value = resolveContainer()
    scrollTarget.value.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', syncActive)
    if (props.hashSync) {
        window.addEventListener('hashchange', onHashChange)
    }
    resolveHeadings()
    void nextTick(() => {
        syncActive()
        if (props.hashSync && window.location.hash) {
            onHashChange()
        }
    })
}

function detach(): void {
    scrollTarget.value?.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', syncActive)
    window.removeEventListener('hashchange', onHashChange)
    scrollTarget.value = null
    if (frame !== null && typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(frame)
        frame = null
    }
}

onMounted(attach)

onBeforeUnmount(detach)

watch(() => props.items, () => {
    void nextTick(() => {
        resolveHeadings()
        syncActive()
    })
}, { deep: true })

watch(() => props.container, attach)

watch(() => props.offset, syncActive)

watch(() => props.hashSync, (enabled) => {
    if (enabled) {
        window.addEventListener('hashchange', onHashChange)
    } else {
        window.removeEventListener('hashchange', onHashChange)
    }
})

defineSlots<{
    /** 自定义条目内容 */
    default?: (props: AnchorSlotProps) => unknown
}>()
</script>

<template>
    <nav
        ref="rootEl"
        class="caomei-anchor"
        :aria-label="accessibleLabel"
    >
        <ul class="caomei-anchor__list">
            <li
                v-for="{item, depth} in flatItems"
                :key="item.key"
                class="caomei-anchor__item"
                :style="{'--caomei-anchor-depth': depth}"
            >
                <a
                    class="caomei-anchor__link"
                    :class="{'caomei-anchor__link--active': active === item.key}"
                    :href="`#${targetId(item)}`"
                    :aria-current="active === item.key ? 'location' : undefined"
                    @click="onClick($event, item)"
                >
                    <slot
                        :active="active"
                        :item="item"
                        :depth="depth"
                    >
                        {{ item.title }}
                    </slot>
                </a>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
.caomei-anchor {
    box-sizing: border-box;
    min-width: 0;
    color: var(--caomei-color-text);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-md);
}

.caomei-anchor__list {
    display: flex;
    flex-direction: column;
    gap: var(--caomei-anchor-gap, var(--caomei-space-1));
    margin: 0;
    padding: 0;
    list-style: none;
}

/* 宿主列表样式会渗透，逐项重置外边距 */
.caomei-anchor__item {
    margin: 0;
    padding-inline-start: calc(var(--caomei-anchor-indent-step, 12px) * var(--caomei-anchor-depth, 0));
    list-style: none;
}

.caomei-anchor__link {
    display: block;
    padding: var(--caomei-anchor-link-padding-y, var(--caomei-space-1)) var(--caomei-anchor-link-padding-x, var(--caomei-space-2));
    border-inline-start: 2px solid transparent;
    color: var(--caomei-color-text-muted);
    line-height: 1.5;
    text-decoration: none;
    transition: color var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard), border-color var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

.caomei-anchor__link:hover {
    color: var(--caomei-color-text);
}

.caomei-anchor__link:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 1px;
}

.caomei-anchor__link--active {
    border-inline-start-color: var(--caomei-color-primary);
    color: var(--caomei-color-primary-text);
}

@media (prefers-reduced-motion: reduce) {
    .caomei-anchor__link {
        transition: none;
    }
}
</style>
