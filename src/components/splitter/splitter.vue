<script setup lang="ts">
import { SplitterGroup } from 'reka-ui'
import { computed, nextTick, onMounted, provide, ref, watch } from 'vue'
import { splitterDirectionKey, splitterPanelKey, type SplitterPanelController } from './context'
import { warnDev } from '../../_shared/dev-warn'
import type { SplitterProps } from './types'

defineOptions({ name: 'CaomeiSplitter', inheritAttrs: false })

const props = withDefaults(defineProps<SplitterProps>(), {
    direction: 'horizontal',
    keyboardResizeBy: 10,
    autoSaveId: undefined,
})

const emit = defineEmits<{
    /** 布局变化（百分比数组，和约为 100） */
    layout: [layout: number[]]
}>()

/** 受控布局：外部写入时应用到各面板；不做双向 model，避免与拖拽事件互相覆盖 */
const layout = defineModel<number[] | undefined>('layout', { default: undefined })

const panels: SplitterPanelController[] = []
/**
 * 从面板实际尺寸回读布局：Reka 的 Enter 折叠 / 展开走 `setLayout` 但不发 `layout` 事件，
 * 只靠事件镜像会让受控模型与渲染永久分叉，这里作为兜底出口。
 */
function syncFromPanels(): void {
    if (panels.length === 0) {
        return
    }
    const sizes = panels.map((panel) => panel.getRenderedSize() ?? panel.getSize())
    if (sizes.some((size) => !Number.isFinite(size))) {
        return
    }
    const numeric = sizes as number[]
    const total = numeric.reduce((sum, size) => sum + size, 0)
    if (total <= 0) {
        return
    }
    const normalized = numeric.map((size) => (size / total) * 100)
    const current = layout.value
    const same = current?.length === normalized.length
        && current.every((value, index) => Math.abs(value - normalized[index]) < 0.5)
    if (same) {
        return
    }
    initialized.value = true
    lastEmitted = normalized
    layout.value = normalized
    emit('layout', normalized)
}

provide(splitterPanelKey, {
    register(controller: SplitterPanelController) {
        panels.push(controller)
    },
    unregister(controller: SplitterPanelController) {
        const index = panels.indexOf(controller)
        if (index !== -1) {
            panels.splice(index, 1)
        }
    },
    sync: syncFromPanels,
})

/** 最近一次由组件抛出的布局：用于区分「外部写入」与「自身事件回环」 */
let lastEmitted: number[] | null = null

/**
 * 首帧初始化是否完成：Reka 在挂载 / autoSave 恢复阶段会先发出一次布局事件，
 * 此时受控初值尚未应用；该阶段忽略事件，避免把 `layout` prop 冲成默认 50/50。
 * 初始化完成后一律镜像 Reka 的实际布局（含 min/max 钳制后的校正值）。
 */
const initialized = ref(false)
provide(splitterDirectionKey, computed(() => props.direction))

function applyLayout(sizes: number[] | undefined): void {
    if (!Array.isArray(sizes) || sizes.length === 0) {
        return
    }
    void nextTick(() => {
        if (sizes.length !== panels.length) {
            warnDev(
                `[CaomeiSplitter] layout 长度（${sizes.length}）与面板数（${panels.length}）不一致，仅按下标应用。`,
            )
        }
        sizes.forEach((size, index) => {
            if (Number.isFinite(size)) {
                panels[index]?.resize(size)
            }
        })
    })
}

function onLayout(sizes: number[]): void {
    lastEmitted = [...sizes]
    if (!initialized.value && layout.value !== undefined) {
        return
    }
    layout.value = [...sizes]
    emit('layout', sizes)
}

// 初值在子面板挂载并登记后再应用；应用前解除首帧守卫，使钳制后的校正值能回写模型
onMounted(() => {
    void nextTick(() => {
        initialized.value = true
        applyLayout(layout.value)
    })
})

watch(layout, (sizes) => {
    if (!sizes) {
        return
    }
    const same = lastEmitted !== null
        && lastEmitted.length === sizes.length
        && lastEmitted.every((value, index) => Math.abs(value - sizes[index]) < 0.01)
    if (!same) {
        applyLayout(sizes)
    }
})

defineExpose({
    /** 以百分比数组设置各面板尺寸 */
    resize: (sizes: number[]): void => {
        applyLayout(sizes)
    },
})
</script>

<template>
    <SplitterGroup
        v-bind="$attrs"
        :direction="direction"
        :keyboard-resize-by="keyboardResizeBy"
        :auto-save-id="autoSaveId"
        class="caomei-splitter"
        :class="`caomei-splitter--${direction}`"
        @layout="onLayout"
    >
        <slot />
    </SplitterGroup>
</template>

<style scoped>
.caomei-splitter {
    display: flex;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
}

.caomei-splitter--horizontal {
    flex-direction: row;
}

.caomei-splitter--vertical {
    flex-direction: column;
}

</style>
