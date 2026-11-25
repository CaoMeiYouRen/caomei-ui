<script setup lang="ts">
import { SplitterResizeHandle } from 'reka-ui'
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { splitterDirectionKey, splitterPanelKey } from './context'
import type { SplitterResizeHandleProps } from './types'

defineOptions({ name: 'CaomeiSplitterResizeHandle', inheritAttrs: false })

const props = withDefaults(defineProps<SplitterResizeHandleProps>(), {
    label: undefined,
    disabled: false,
})

const messages = useLocale()
const accessibleLabel = computed(() => props.label ?? messages.value.splitter.resize)

/** 键盘可能触发「不发布局事件」的内部变更（Enter 折叠 / 展开），下一拍按实际尺寸回读 */
function onKeydown(): void {
    // 折叠 / 展开由 Reka 在 keydown 内触发，布局值经多拍才写回；按短间隔回读几次收敛
    for (const delay of [0, 40, 120]) {
        timers.push(setTimeout(() => {
            registry?.sync()
        }, delay))
    }
}

// 原生监听挂在真实元素上：Reka 手柄组件不转发组件级事件监听
onMounted(() => {
    const element = handleRef.value?.$el
    if (element instanceof HTMLElement) {
        element.addEventListener('keydown', onKeydown)
    }
})

onBeforeUnmount(() => {
    const element = handleRef.value?.$el
    if (element instanceof HTMLElement) {
        element.removeEventListener('keydown', onKeydown)
    }
    for (const timer of timers.splice(0)) {
        clearTimeout(timer)
    }
})
const direction = inject(splitterDirectionKey, null)
const registry = inject(splitterPanelKey, null)
const attrs = useAttrs()
const handleRef = ref<{ $el?: unknown } | null>(null)
const timers: ReturnType<typeof setTimeout>[] = []
/** 水平分栏的拖拽条是垂直方向的分隔线（反之亦然） */
const orientation = computed(() => {
    const value = direction?.value ?? (document.querySelector('.caomei-splitter--vertical') ? 'vertical' : 'horizontal')
    return value === 'vertical' ? 'horizontal' : 'vertical'
})
</script>

<template>
    <SplitterResizeHandle
        ref="handleRef"
        :disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        :aria-label="accessibleLabel"
        :aria-orientation="orientation"
        class="caomei-splitter__handle"
        v-bind="attrs"
    >
        <slot>
            <span
                class="caomei-splitter__handle-grip"
                aria-hidden="true"
            />
        </slot>
    </SplitterResizeHandle>
</template>

<style scoped>
.caomei-splitter__handle {
    position: relative;
    z-index: var(--caomei-splitter-handle-z-index, var(--caomei-z-raise));
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    border: 0;
    background: var(--caomei-splitter-handle-bg, var(--caomei-color-border));
    cursor: col-resize;
    outline: none;
    touch-action: none;
}

.caomei-splitter__handle:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: -1px;
}

/* 命中区放大到 13px（3px 视觉线 + 两侧 5px），视觉仍为 3px 分隔线 */
.caomei-splitter__handle::before {
    position: absolute;
    inset: 0 -5px;
    content: '';
}

.caomei-splitter--vertical .caomei-splitter__handle {
    cursor: row-resize;
}

.caomei-splitter--vertical .caomei-splitter__handle::before {
    inset: -5px 0;
}

.caomei-splitter__handle[data-disabled] {
    cursor: default;
}

.caomei-splitter__handle-grip {
    position: relative;
    display: block;
    border-radius: var(--caomei-radius-full);

    /* 与 3px 分隔线区分：默认取弱化文字色的 60%，避免同色形成无效装饰 */
    background: var(--caomei-splitter-grip-bg, color-mix(in srgb, var(--caomei-color-text-muted) 60%, transparent));
}

.caomei-splitter--horizontal .caomei-splitter__handle-grip {
    width: var(--caomei-splitter-grip-size, 3px);
    height: var(--caomei-splitter-grip-length, 1.5rem);
}

.caomei-splitter--vertical .caomei-splitter__handle-grip {
    width: var(--caomei-splitter-grip-length, 1.5rem);
    height: var(--caomei-splitter-grip-size, 3px);
}
</style>
