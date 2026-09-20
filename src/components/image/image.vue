<script setup lang="ts">
import { Eye, ImageOff, X } from '@lucide/vue'
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { CaomeiIcon } from '../../icons'
import type { ImageProps, ImageStatus } from './types'

defineOptions({ name: 'CaomeiImage', inheritAttrs: false })

defineSlots<{
    loading?: () => unknown
    error?: () => unknown
    indicatoricon?: () => unknown
}>()

const props = withDefaults(defineProps<ImageProps>(), {
    alt: '',
    ratio: undefined,
    fit: 'cover',
    lazy: false,
    preview: false,
})

const emit = defineEmits<{
    load: [event: Event]
    error: [event: Event]
    show: []
    hide: []
}>()

const rootRef = ref<HTMLElement>()
const imgRef = ref<HTMLImageElement>()
const status = ref<ImageStatus>('loading')
// 初值只由 lazy 决定，保证 SSR 与客户端首次渲染一致；不支持 IntersectionObserver 时在挂载后回退为立即加载
const shouldLoad = ref(!props.lazy)

const locale = useLocale()
const previewLabel = computed(() => locale.value.image.preview)
const previewTitle = computed(() => locale.value.image.label)
const closeLabel = computed(() => locale.value.image.close)

// 预览为组件内部状态（对齐 PrimeVue：无受控 prop），开合经 `show` / `hide` 事件对外表达
const previewOpen = ref(false)

watch(previewOpen, (value) => {
    if (value) {
        emit('show')
    } else {
        emit('hide')
    }
})

// `preview` 关闭时收回已打开的遮罩（含外部受控关闭属性）
watch(() => props.preview, (enabled) => {
    if (!enabled) {
        previewOpen.value = false
    }
})

const ratioStyle = computed(() => (props.ratio === undefined
    ? undefined
    : { aspectRatio: String(props.ratio) }))
const imgStyle = computed(() => ({ objectFit: props.fit }))

let observer: IntersectionObserver | undefined

function teardownObserver(): void {
    observer?.disconnect()
    observer = undefined
}

function startObserving(): void {
    if (!props.lazy || shouldLoad.value) {
        return
    }
    if (typeof IntersectionObserver === 'undefined' || !rootRef.value) {
        shouldLoad.value = true
        return
    }
    observer = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            shouldLoad.value = true
            teardownObserver()
        }
    })
    observer.observe(rootRef.value)
}

onMounted(() => {
    // SSR / 水合兜底：服务端直出的 img 可能在水合前已完成加载，此时不会再触发 load。
    // 该分支不补发 load / error 事件，仅同步内部状态。
    const img = imgRef.value
    if (img?.complete) {
        status.value = img.naturalWidth > 0 ? 'loaded' : 'error'
    }
    startObserving()
})

onBeforeUnmount(teardownObserver)

watch(() => props.src, () => {
    status.value = 'loading'
})

watch(() => props.lazy, (lazy) => {
    if (!lazy) {
        shouldLoad.value = true
        teardownObserver()
        return
    }
    if (!shouldLoad.value) {
        startObserving()
    }
})

function handleLoad(event: Event): void {
    status.value = 'loaded'
    emit('load', event)
}

function handleError(event: Event): void {
    status.value = 'error'
    emit('error', event)
}
</script>

<template>
    <div
        ref="rootRef"
        v-bind="$attrs"
        class="caomei-image"
        :class="[`caomei-image--${status}`, {'caomei-image--ratio': ratio !== undefined}]"
        :style="ratioStyle"
    >
        <img
            v-if="shouldLoad"
            :key="src"
            ref="imgRef"
            class="caomei-image__img"
            :src="src"
            :alt="alt"
            :style="imgStyle"
            @load="handleLoad"
            @error="handleError"
        >
        <!-- 仅加载成功后提供预览入口：失败 / 加载中打开遮罩没有可放大内容。
             入口经 DialogTrigger 无条件登记 triggerElement（DialogContentImpl 仅在活动元素
             非 body 时回退捕获 activeElement），关闭后才能把焦点稳定交回入口。 -->
        <DialogRoot v-model:open="previewOpen">
            <DialogTrigger
                v-if="preview && status === 'loaded'"
                as-child
            >
                <button
                    type="button"
                    class="caomei-image__preview-trigger"
                    :aria-label="previewLabel"
                >
                    <span class="caomei-image__preview-icon">
                        <slot name="indicatoricon">
                            <CaomeiIcon :icon="previewIcon ?? Eye" />
                        </slot>
                    </span>
                </button>
            </DialogTrigger>
            <DialogPortal>
                <DialogOverlay class="caomei-image__preview-overlay" />
                <DialogContent
                    class="caomei-image__preview-content"
                    aria-modal="true"
                >
                    <DialogTitle class="caomei-image__preview-title">
                        {{ previewTitle }}
                    </DialogTitle>
                    <DialogDescription class="caomei-image__preview-description">
                        {{ alt }}
                    </DialogDescription>
                    <DialogClose
                        class="caomei-image__preview-close"
                        :aria-label="closeLabel"
                    >
                        <CaomeiIcon :icon="X" />
                    </DialogClose>
                    <img
                        class="caomei-image__preview-img"
                        :src="src"
                        :alt="alt"
                    >
                </DialogContent>
            </DialogPortal>
        </DialogRoot>
        <div
            v-if="status === 'loading'"
            class="caomei-image__placeholder caomei-image__placeholder--loading"
            aria-hidden="true"
        >
            <slot name="loading" />
        </div>
        <div
            v-else-if="status === 'error'"
            class="caomei-image__placeholder caomei-image__placeholder--error"
        >
            <slot name="error">
                <CaomeiIcon
                    :icon="ImageOff"
                    class="caomei-image__fallback"
                />
            </slot>
        </div>
    </div>
</template>

<style scoped>
.caomei-image {
    position: relative;
    display: block;
    overflow: hidden;
    background: var(--caomei-image-bg, var(--caomei-color-bg-elevated));
}

.caomei-image__img {
    display: block;
    width: 100%;
    height: 100%;
}

.caomei-image__placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--caomei-image-placeholder-color, var(--caomei-color-text-muted));
    font-size: var(--caomei-image-placeholder-size, 24px);
}

.caomei-image__placeholder--loading {
    background: var(--caomei-image-loading-bg, var(--caomei-color-bg-elevated));
    animation: caomei-image-pulse 1.2s ease-in-out infinite;
}

/* 覆盖整张图的点击入口：悬停 / 聚焦时以遮罩底色显现指示器，粗指针设备常显 */
.caomei-image__preview-trigger {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--caomei-image-preview-color, var(--caomei-color-on-solid));
    cursor: zoom-in;
    font-size: var(--caomei-image-preview-icon-size, 24px);
}

.caomei-image__preview-trigger:hover,
.caomei-image__preview-trigger:focus-visible {
    background: var(--caomei-color-mask);
}

.caomei-image__preview-trigger:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -2px;
}

.caomei-image__preview-icon {
    opacity: 0;
    transition: opacity 150ms ease;
}

.caomei-image__preview-trigger:hover .caomei-image__preview-icon,
.caomei-image__preview-trigger:focus-visible .caomei-image__preview-icon {
    opacity: 1;
}

/* 预览为最高层模态：默认取 Toast 同层（1100），高于 Dialog / Drawer（1000 / 1001）与浮层（1050），
   内容再 +1；可按需覆盖该变量。 */
.caomei-image__preview-overlay {
    position: fixed;
    z-index: var(--caomei-image-preview-z-index, var(--caomei-z-toast));
    inset: 0;
    background: var(--caomei-color-mask);
}

.caomei-image__preview-content {
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: calc(var(--caomei-image-preview-z-index, var(--caomei-z-toast)) + 1);
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 90vw;
    max-height: 90vh;
    transform: translate(-50%, -50%);
}

.caomei-image__preview-title,
.caomei-image__preview-description {
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

.caomei-image__preview-img {
    display: block;
    max-width: 90vw;
    max-height: 90vh;
    border-radius: var(--caomei-radius-md);
    object-fit: contain;
}

.caomei-image__preview-close {
    position: absolute;
    top: var(--caomei-space-2);
    right: var(--caomei-space-2);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--caomei-space-1);
    border: 0;
    border-radius: var(--caomei-radius-full);
    background: var(--caomei-color-mask);
    color: var(--caomei-image-preview-close-color, var(--caomei-color-on-solid));
    cursor: pointer;
    font-size: var(--caomei-image-preview-close-size, 20px);
}

.caomei-image__preview-close:focus-visible {
    outline: 2px solid var(--caomei-color-on-solid);
    outline-offset: 2px;
}

@keyframes caomei-image-pulse {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.55;
    }
}

@media (pointer: coarse) {
    /* 粗指针设备无 hover，指示器常显并带底色保证可发现性与对比度 */
    .caomei-image__preview-icon {
        opacity: 1;
        padding: var(--caomei-space-2);
        border-radius: var(--caomei-radius-full);
        background: var(--caomei-color-mask);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-image__placeholder--loading {
        animation: none;
    }

    .caomei-image__preview-icon {
        transition: none;
    }
}
</style>
