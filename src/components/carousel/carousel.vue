<script setup lang="ts">
import emblaCarouselVue from 'embla-carousel-vue'
import { computed, provide, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { CaomeiButton } from '../button'
import { carouselContextKey, resolveCarouselIndex } from './context'
import type { CarouselContext } from './context'
import type { CarouselProps } from './types'

defineOptions({ name: 'CaomeiCarousel', inheritAttrs: false })

type EmblaApi = NonNullable<ReturnType<typeof emblaCarouselVue>[1]['value']>

const props = withDefaults(defineProps<CarouselProps>(), {
    orientation: 'horizontal',
    loop: false,
    slidesPerView: 1,
    gap: 0,
    controls: true,
    controlSize: 'sm',
    label: undefined,
})

/** 当前页索引（`v-model:index`），与 embla 的 scroll snap（页）对齐，不是子页序号 */
const index = defineModel<number>('index', { default: 0 })

defineSlots<{
    /** 轮播页；每个子项应为 `CaomeiCarouselSlide` */
    default?: () => unknown
}>()

const messages = useLocale()
const icons = useInternalIcons()

const isVertical = computed(() => props.orientation === 'vertical')
const slidesPerView = computed(() => {
    if (props.slidesPerView === 'auto') {
        return 'auto'
    }
    const value = Number.isFinite(props.slidesPerView) ? Math.trunc(props.slidesPerView as number) : 1
    return Math.max(value, 1)
})
const isAutoWidth = computed(() => slidesPerView.value === 'auto')
const gapLength = computed(() => (typeof props.gap === 'number' ? `${Math.max(props.gap, 0)}px` : props.gap))

const rootStyle = computed(() => {
    const style: Record<string, string> = { '--caomei-carousel-gap': gapLength.value }
    if (slidesPerView.value !== 'auto') {
        style['--caomei-carousel-slides-per-view'] = String(slidesPerView.value)
    }
    return style
})

/**
 * embla 选项：尺寸为 0 的容器（隐藏或未布局）不会初始化出可用 snap，
 * 这里不做特殊处理，由 `reInit` 事件在尺寸恢复后同步。
 */
const options = computed(() => ({
    axis: isVertical.value ? 'y' as const : 'x' as const,
    loop: props.loop,
    align: 'start' as const,
    slidesToScroll: 1,
    containScroll: props.loop ? false as const : 'trimSnaps' as const,
}))

const [viewportRef, emblaApi] = emblaCarouselVue(options)

const pageCount = ref(0)
const selectedPage = ref(0)
const canScrollPrev = ref(false)
const canScrollNext = ref(false)

/**
 * 主轴实测尺寸。为 0 表示容器尚未布局（`v-show` / 折叠 / 隐藏页签），
 * 此时 embla 会折叠成单个 snap，不能据此回写受控模型。
 */
function axisSize(api: EmblaApi): number {
    const node = api.rootNode()
    return isVertical.value ? node.clientHeight : node.clientWidth
}

/** 从 embla 回读状态；`select` / `reInit` 与首次挂载后共用 */
function syncFromApi(): void {
    const api = emblaApi.value
    if (!api) {
        return
    }
    pageCount.value = api.scrollSnapList().length
    canScrollPrev.value = api.canScrollPrev()
    canScrollNext.value = api.canScrollNext()
    selectedPage.value = api.selectedScrollSnap()
    if (axisSize(api) <= 0) {
        return
    }
    if (index.value !== selectedPage.value) {
        index.value = selectedPage.value
    }
}

/**
 * 把外部模型应用到 embla：先定位，再把钳位结果回写模型。
 * 初始挂载必须走这条路径，否则首次 `syncFromApi()` 会把受控初值覆盖成 0。
 */
function applyIndex(api: EmblaApi): void {
    if (axisSize(api) <= 0) {
        return
    }
    const target = resolveCarouselIndex(index.value, api.scrollSnapList().length, props.loop)
    if (api.selectedScrollSnap() !== target) {
        api.scrollTo(target)
    }
    if (target !== index.value) {
        index.value = target
    }
}

/** 重新测量后先按外部模型定位，再回读；退化测量期间模型保持不动 */
function onReInit(): void {
    const api = emblaApi.value
    if (!api) {
        return
    }
    applyIndex(api)
    syncFromApi()
}

watch(emblaApi, (api, previous) => {
    if (previous) {
        previous.off('select', syncFromApi)
        previous.off('reInit', onReInit)
    }
    if (!api) {
        return
    }
    api.on('select', syncFromApi)
    api.on('reInit', onReInit)
    applyIndex(api)
    syncFromApi()
}, { immediate: true })

/** 受控索引：外部写入时翻到对应页；越界按方向钳位或取模，并回写钳位后的值 */
watch(index, () => {
    const api = emblaApi.value
    if (!api) {
        return
    }
    applyIndex(api)
})

function scrollPrev(): void {
    emblaApi.value?.scrollPrev()
}

function scrollNext(): void {
    emblaApi.value?.scrollNext()
}

function scrollToPage(page: number): void {
    emblaApi.value?.scrollTo(page)
}

/** 表单控件与可编辑区域内不接管方向键，避免与输入行为冲突 */
function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
        return false
    }
    const tag = target.tagName
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable
}

/** 键盘翻页：方向键按轮播方向取横向或纵向，Home / End 直达首末页 */
function onKeydown(event: KeyboardEvent): void {
    const api = emblaApi.value
    if (!api || isEditableTarget(event.target)) {
        return
    }
    const nextKey = isVertical.value ? 'ArrowDown' : 'ArrowRight'
    const prevKey = isVertical.value ? 'ArrowUp' : 'ArrowLeft'
    if (event.key === nextKey) {
        event.preventDefault()
        api.scrollNext()
        return
    }
    if (event.key === prevKey) {
        event.preventDefault()
        api.scrollPrev()
        return
    }
    if (event.key === 'Home') {
        event.preventDefault()
        api.scrollTo(0)
        return
    }
    if (event.key === 'End') {
        event.preventDefault()
        api.scrollTo(Math.max(pageCount.value - 1, 0))
    }
}

const prevIcon = computed(() => (isVertical.value ? icons.value.chevronUp : icons.value.chevronLeft))
const nextIcon = computed(() => (isVertical.value ? icons.value.chevronDown : icons.value.chevronRight))

const slideIds = ref<symbol[]>([])

const context: CarouselContext = {
    registerSlide(id) {
        if (!slideIds.value.includes(id)) {
            slideIds.value = [...slideIds.value, id]
        }
    },
    unregisterSlide(id) {
        slideIds.value = slideIds.value.filter((item) => item !== id)
    },
    slideIndex(id) {
        return slideIds.value.indexOf(id)
    },
    slideLabel(slideIndex) {
        const total = slideIds.value.length
        if (slideIndex < 0 || total <= 0) {
            return undefined
        }
        return messages.value.carousel.slide
            .replace('{index}', String(slideIndex + 1))
            .replace('{total}', String(total))
    },
}

provide(carouselContextKey, context)
</script>

<template>
    <div
        v-bind="$attrs"
        class="caomei-carousel"
        :class="[
            `caomei-carousel--${orientation}`,
            {'caomei-carousel--auto': isAutoWidth}
        ]"
        :style="rootStyle"
        :role="label ? 'region' : 'group'"
        aria-roledescription="carousel"
        :aria-label="label"
        tabindex="0"
        @keydown="onKeydown"
    >
        <div
            ref="viewportRef"
            class="caomei-carousel__viewport"
        >
            <div class="caomei-carousel__container">
                <slot />
            </div>
        </div>

        <template v-if="controls">
            <CaomeiButton
                class="caomei-carousel__nav caomei-carousel__nav--prev"
                icon-only
                variant="secondary"
                :size="controlSize"
                :label="messages.carousel.prev"
                :disabled="!canScrollPrev"
                @click="scrollPrev"
            >
                <template #icon>
                    <CaomeiIcon :icon="prevIcon" />
                </template>
            </CaomeiButton>
            <CaomeiButton
                class="caomei-carousel__nav caomei-carousel__nav--next"
                icon-only
                variant="secondary"
                :size="controlSize"
                :label="messages.carousel.next"
                :disabled="!canScrollNext"
                @click="scrollNext"
            >
                <template #icon>
                    <CaomeiIcon :icon="nextIcon" />
                </template>
            </CaomeiButton>

            <div
                v-if="pageCount > 1"
                class="caomei-carousel__dots"
            >
                <button
                    v-for="page in pageCount"
                    :key="page"
                    type="button"
                    class="caomei-carousel__dot"
                    :class="{'caomei-carousel__dot--active': page - 1 === selectedPage}"
                    :aria-label="`${page} / ${pageCount}`"
                    :aria-current="page - 1 === selectedPage ? 'true' : undefined"
                    @click="scrollToPage(page - 1)"
                />
            </div>
        </template>
    </div>
</template>

<style scoped>
.caomei-carousel {
    position: relative;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
}

:where(.caomei-carousel) {
    --caomei-carousel-gap: 0px;
    --caomei-carousel-slides-per-view: 1;
}

.caomei-carousel:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}

.caomei-carousel--vertical {
    height: 100%;
}

.caomei-carousel__viewport {
    overflow: hidden;
}

.caomei-carousel--vertical .caomei-carousel__viewport {
    min-height: 0;
    flex: 1 1 auto;
}

.caomei-carousel__container {
    display: flex;
    gap: var(--caomei-carousel-gap);
}

.caomei-carousel--horizontal .caomei-carousel__container {
    flex-direction: row;
}

.caomei-carousel--vertical .caomei-carousel__container {
    flex-direction: column;
    height: 100%;
}

.caomei-carousel :deep(.caomei-carousel__slide) {
    flex: 0 0 calc((100% - var(--caomei-carousel-gap) * (var(--caomei-carousel-slides-per-view) - 1)) / var(--caomei-carousel-slides-per-view));
}

.caomei-carousel--auto :deep(.caomei-carousel__slide) {
    flex: 0 0 auto;
}

.caomei-carousel__nav {
    position: absolute;
    top: 50%;
    z-index: var(--caomei-z-raise);
    transform: translateY(-50%);
}

.caomei-carousel--vertical .caomei-carousel__nav {
    top: auto;
    left: 50%;
    transform: translateX(-50%);
}

.caomei-carousel__nav--prev {
    left: 8px;
}

.caomei-carousel__nav--next {
    right: 8px;
}

.caomei-carousel--vertical .caomei-carousel__nav--prev {
    top: 8px;
    left: 50%;
}

.caomei-carousel--vertical .caomei-carousel__nav--next {
    right: auto;
    bottom: 8px;
    left: 50%;
}

.caomei-carousel__dots {
    display: flex;
    gap: 6px;
    justify-content: center;
    padding-block-start: 8px;
}

.caomei-carousel__dot {
    width: 24px;
    height: 24px;
    padding: 8px;
    border: 0;
    background: transparent;
    cursor: pointer;
}

.caomei-carousel__dot::before {
    display: block;
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--caomei-color-border);
    content: '';
    transition: background-color var(--caomei-motion-duration-base) var(--caomei-motion-ease-standard);
}

.caomei-carousel__dot:hover::before {
    background: var(--caomei-color-text-muted);
}

.caomei-carousel__dot--active::before {
    background: var(--caomei-color-primary);
}

.caomei-carousel__dot:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
}
</style>
