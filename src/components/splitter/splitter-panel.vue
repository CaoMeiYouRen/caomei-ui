<script setup lang="ts">
import { SplitterPanel } from 'reka-ui'
import { computed, inject, onBeforeUnmount, onMounted, ref, useAttrs, watchEffect } from 'vue'
import { warnDev } from '../../_shared/dev-warn'
import { splitterPanelKey } from './context'
import type { SplitterPanelProps } from './types'

defineOptions({ name: 'CaomeiSplitterPanel', inheritAttrs: false })

withDefaults(defineProps<SplitterPanelProps>(), {
    defaultSize: undefined,
    minSize: undefined,
    maxSize: undefined,
    collapsible: false,
    collapsedSize: undefined,
})

const panelRef = ref<{ $el?: unknown, resize?: (size: number) => void, getSize?: () => number } | null>(null)
const registry = inject(splitterPanelKey, null)

/**
 * 面板顺序由书写顺序决定：显式透传的 `order` 会与登记表下标错位，这里从透传属性中剔除。
 */
const attrs = useAttrs()
const forwardedAttrs = computed(() => {
    const { order: _order, ...rest } = attrs
    return rest
})

watchEffect(() => {
    if ('order' in attrs) {
        warnDev('[CaomeiSplitterPanel] 面板顺序由书写顺序决定，`order` 属性不生效。')
    }
})

/** 供根组件按受控布局调用：Reka 面板暴露 `resize(size)`（百分比单位） */
const controller = {
    resize(size: number): void {
        panelRef.value?.resize?.(size)
    },
    getSize(): number | undefined {
        return panelRef.value?.getSize?.()
    },
    getRenderedSize(): number | undefined {
        const element = panelRef.value?.$el
        if (!(element instanceof HTMLElement)) {
            return undefined
        }
        const raw = element.dataset.panelSize
        return raw === undefined ? undefined : Number.parseFloat(raw)
    },
}

onMounted(() => {
    registry?.register(controller)
})

onBeforeUnmount(() => {
    registry?.unregister(controller)
})
</script>

<template>
    <SplitterPanel
        ref="panelRef"
        v-bind="forwardedAttrs"
        :default-size="defaultSize"
        :min-size="minSize"
        :max-size="maxSize"
        :collapsible="collapsible"
        :collapsed-size="collapsedSize"
        class="caomei-splitter__panel"
    >
        <slot />
    </SplitterPanel>
</template>

<style scoped>
.caomei-splitter__panel {
    min-width: 0;
    min-height: 0;
    overflow: auto;
}
</style>
