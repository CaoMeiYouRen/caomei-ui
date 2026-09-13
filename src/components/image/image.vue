<script setup lang="ts">
import { ImageOff } from '@lucide/vue'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CaomeiIcon } from '../../icons'
import type { ImageProps, ImageStatus } from './types'

defineOptions({ name: 'CaomeiImage', inheritAttrs: false })

defineSlots<{
    loading?: () => unknown
    error?: () => unknown
}>()

const props = withDefaults(defineProps<ImageProps>(), {
    alt: '',
    ratio: undefined,
    fit: 'cover',
    lazy: false,
})

const emit = defineEmits<{
    load: [event: Event]
    error: [event: Event]
}>()

const rootRef = ref<HTMLElement>()
const imgRef = ref<HTMLImageElement>()
const status = ref<ImageStatus>('loading')
// 初值只由 lazy 决定，保证 SSR 与客户端首次渲染一致；不支持 IntersectionObserver 时在挂载后回退为立即加载
const shouldLoad = ref(!props.lazy)

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

@keyframes caomei-image-pulse {
    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.55;
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-image__placeholder--loading {
        animation: none;
    }
}
</style>
