<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { WatermarkProps, WatermarkSpacing } from './types'

defineOptions({ name: 'CaomeiWatermark', inheritAttrs: false })

const props = withDefaults(defineProps<WatermarkProps>(), {
    content: undefined,
    image: undefined,
    rotate: -22,
    opacity: 0.15,
    gap: 100,
    offset: 0,
    imageWidth: 120,
    imageHeight: 64,
    fontSize: 16,
    color: undefined,
    zIndex: undefined,
})

/** 文本水印的字体族：与 CSS 变量无关，仅决定测量与绘制的字形度量 */
const FONT_FAMILY = 'system-ui, sans-serif'

/** 观察范围：子节点、属性与文本内容变化都会触发重建 */
const OBSERVE_OPTIONS: MutationObserverInit = {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,
}

const rootRef = ref<HTMLElement | null>(null)
const overlayRef = ref<HTMLElement | null>(null)

let observer: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null
let imageEl: HTMLImageElement | null = null
let frame: ReturnType<typeof setTimeout> | null = null
/** 绘制代次：快速切换 `image` / 内容时丢弃过期回调 */
let requestId = 0

/** 归一化间距 / 偏移为 [水平, 垂直] */
function toPair(value: WatermarkSpacing): [number, number] {
    return Array.isArray(value) ? [value[0], value[1]] : [value, value]
}

/** 读取根元素的计算文字色，作为文本水印的缺省颜色 */
function resolveColor(): string {
    const root = rootRef.value
    if (!root || typeof window === 'undefined') {
        return ''
    }
    return window.getComputedStyle(root).color
}

/** 暂停观察：重建期间自身写入遮罩样式不应被当成外部变更 */
function pauseObserving(): void {
    observer?.disconnect()
}

function resumeObserving(): void {
    const root = rootRef.value
    if (observer && root) {
        observer.observe(root, OBSERVE_OPTIONS)
    }
}

/** 把平铺尺寸、偏移与层级写回遮罩 */
function applyTile(tileWidth: number, tileHeight: number): void {
    const overlay = overlayRef.value
    if (!overlay) {
        return
    }
    const [offsetX, offsetY] = toPair(props.offset)
    if (props.zIndex === undefined) {
        overlay.style.removeProperty('--caomei-watermark-z-index')
    } else {
        overlay.style.setProperty('--caomei-watermark-z-index', String(props.zIndex))
    }
    overlay.style.backgroundSize = `${tileWidth}px ${tileHeight}px`
    overlay.style.backgroundPosition = `${offsetX}px ${offsetY}px`
}

/** 清空遮罩，避免无内容时残留上一次的平铺与层级 */
function clearTile(): void {
    const overlay = overlayRef.value
    if (!overlay) {
        return
    }
    overlay.style.backgroundImage = ''
    overlay.style.removeProperty('background-size')
    overlay.style.removeProperty('background-position')
    overlay.style.removeProperty('--caomei-watermark-z-index')
}

/** 逐帧重建：调用方负责暂停 / 恢复观察 */
function render(): void {
    const overlay = overlayRef.value
    if (!overlay || typeof document === 'undefined') {
        return
    }

    const current = ++requestId
    const [gapX, gapY] = toPair(props.gap)
    const color = props.color ?? resolveColor()
    const ratio = typeof window === 'undefined' ? 1 : Math.min(window.devicePixelRatio || 1, 3)
    const angle = (props.rotate * Math.PI) / 180

    const paint = (source: HTMLImageElement | string): void => {
        const canvas = document.createElement('canvas')
        const measureContext = canvas.getContext('2d')
        if (!measureContext) {
            return
        }

        const text = typeof source === 'string' ? source : null
        const image = typeof source === 'string' ? null : source
        let contentWidth = 0
        let contentHeight = 0
        if (text !== null) {
            measureContext.font = `${props.fontSize}px ${FONT_FAMILY}`
            contentWidth = Math.ceil(measureContext.measureText(text).width)
            contentHeight = Math.ceil(props.fontSize * 1.4)
        } else {
            contentWidth = props.imageWidth
            contentHeight = props.imageHeight
        }

        // 平铺格须容纳旋转后的包围盒，否则边缘会裁掉斜排文字 / 图片
        const cos = Math.abs(Math.cos(angle))
        const sin = Math.abs(Math.sin(angle))
        const tileWidth = Math.max(Math.ceil(contentWidth * cos + contentHeight * sin) + gapX, 1)
        const tileHeight = Math.max(Math.ceil(contentWidth * sin + contentHeight * cos) + gapY, 1)

        canvas.width = Math.ceil(tileWidth * ratio)
        canvas.height = Math.ceil(tileHeight * ratio)

        const tileContext = canvas.getContext('2d')
        if (!tileContext) {
            return
        }
        // 设置 canvas 尺寸会重置 2D 状态，缩放 / 位移 / 字体都必须在尺寸之后设置
        tileContext.scale(ratio, ratio)
        tileContext.translate(tileWidth / 2, tileHeight / 2)
        tileContext.rotate(angle)
        tileContext.globalAlpha = Math.min(Math.max(props.opacity, 0), 1)

        if (text !== null) {
            tileContext.font = `${props.fontSize}px ${FONT_FAMILY}`
            tileContext.fillStyle = color
            tileContext.textAlign = 'center'
            tileContext.textBaseline = 'middle'
            tileContext.fillText(text, 0, 0)
        } else if (image !== null) {
            tileContext.drawImage(image, -contentWidth / 2, -contentHeight / 2, contentWidth, contentHeight)
        }

        overlay.style.backgroundImage = `url(${canvas.toDataURL('image/png')})`
        applyTile(tileWidth, tileHeight)
    }

    if (props.image && typeof Image !== 'undefined') {
        const img = new Image()
        imageEl = img
        img.crossOrigin = 'anonymous'
        img.onload = (): void => {
            if (current !== requestId) {
                return
            }
            pauseObserving()
            paint(img)
            resumeObserving()
        }
        img.onerror = (): void => {
            if (current !== requestId) {
                return
            }
            pauseObserving()
            if (props.content) {
                paint(props.content)
            }
            resumeObserving()
        }
        img.src = props.image
        return
    }

    if (props.content) {
        paint(props.content)
        return
    }

    clearTile()
}

/** 重建：暂停观察 → 重绘 → 恢复观察 */
function rebuild(): void {
    pauseObserving()
    render()
    resumeObserving()
}

/** 下一帧重建，合并同一帧内的多次变更 */
function scheduleRebuild(): void {
    if (frame !== null) {
        clearTimeout(frame)
    }
    frame = setTimeout(() => {
        frame = null
        rebuild()
    }, 0)
}

onMounted(() => {
    render()

    const root = rootRef.value
    if (!root) {
        return
    }
    if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(scheduleRebuild)
        observer.observe(root, OBSERVE_OPTIONS)
    }
    if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(scheduleRebuild)
        resizeObserver.observe(root)
    }
})

onBeforeUnmount(() => {
    observer?.disconnect()
    observer = null
    resizeObserver?.disconnect()
    resizeObserver = null
    if (frame !== null) {
        clearTimeout(frame)
        frame = null
    }
    if (imageEl) {
        imageEl.onload = null
        imageEl.onerror = null
        imageEl = null
    }
})

watch(() => [props.content, props.image, props.rotate, props.opacity, props.gap, props.offset, props.fontSize, props.color, props.zIndex, props.imageWidth, props.imageHeight], () => {
    rebuild()
})
</script>

<template>
    <div
        v-bind="$attrs"
        ref="rootRef"
        class="caomei-watermark"
    >
        <slot />
        <div
            ref="overlayRef"
            class="caomei-watermark__overlay"
            aria-hidden="true"
        />
    </div>
</template>

<style scoped>
.caomei-watermark {
    position: relative;
    min-width: 0;
}

.caomei-watermark__overlay {
    position: absolute;
    inset: 0;
    background-repeat: repeat;
    pointer-events: none;
    z-index: var(--caomei-watermark-z-index, var(--caomei-z-raise));
}
</style>
