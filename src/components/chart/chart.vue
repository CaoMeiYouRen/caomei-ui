<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useAttrs, type ClassValue, type Component, type StyleValue } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { labelAttrs, resolveLabelName } from '../_shared/use-label-attrs'
import { loadChart } from './chart-loader'
import type { ChartProps } from './types'

defineOptions({ name: 'CaomeiChart', inheritAttrs: false })

const props = withDefaults(defineProps<ChartProps>(), {
    autoresize: true,
    loading: false,
})

const locale = useLocale()
const attrs = useAttrs()

/** 根元素类名与内联样式单独绑定，便于把 `height` 与使用方传入的样式合并。 */
const rootClass = computed(() => attrs.class as ClassValue)
const rootStyle = computed<StyleValue>(() => [attrs.style as StyleValue, chartStyle.value])

/**
 * 解析后的可访问名：显式 `label` > 透传 `aria-label`（第三级兜底文案由使用方决定，本组件不内建）。
 *
 * 角色由**解析结果**驱动而非仅由 `label` prop 驱动：ARIA 1.2 禁止在无角色的通用元素上命名
 * （`aria-label` + 无 `role` 的 `div` 属 `aria-prohibited-attr`），故只在确有可访问名时授予
 * `role="group"`，两者皆空时既不授角色也不输出 `aria-label`。
 */
const accessibleName = computed(() => resolveLabelName(props.label, attrs['aria-label'], undefined))

/**
 * 其余透传属性。显式透传的 `role` 会覆盖组件授予的 `role="group"`（逃生舱：需要 `figure` 等语义时
 * 由使用方自行承担命名与角色的合规性）。
 */
const rootAttrs = computed<Record<string, unknown>>(() => {
    const { class: _class, style: _style, 'aria-label': _forwarded, ...rest } = attrs
    return { ...rest, ...labelAttrs(accessibleName.value) }
})

/**
 * 图表内核来自可选 peer 依赖 `vue-echarts`（其 peer `echarts` 提供运行时），**按需加载**：
 * 未安装时不影响包根与未使用本组件的下游；加载在 `onMounted` 之后发起，故 SSR 只输出占位。
 */
const status = ref<'loading' | 'ready' | 'failed'>('loading')
const chartModule = shallowRef<Component | null>(null)

const chartStyle = computed(() => (props.height ? { height: props.height } : undefined))

function devWarn(message: string): void {
    // 逐级可选访问：兼容消费者注入「不含 env 的 process shim」，保证告警路径自身不抛错。
    const env = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
    if (env?.NODE_ENV === 'production') {
        return
    }
    console.warn(message)
}

onMounted(async () => {
    try {
        const module = await loadChart()
        chartModule.value = module.VChart
        status.value = 'ready'
    } catch (error) {
        status.value = 'failed'
        devWarn(
            `[CaomeiChart] 图表内核加载失败，请确认已安装可选依赖 vue-echarts 及其 peer echarts。${String(error)}`,
        )
    }
})
</script>

<template>
    <div
        class="caomei-chart"
        :class="rootClass"
        :style="rootStyle"
        :role="accessibleName ? 'group' : undefined"
        v-bind="rootAttrs"
    >
        <component
            :is="chartModule"
            v-if="chartModule"
            class="caomei-chart__canvas"
            :option="props.option"
            :theme="props.theme"
            :init-options="props.initOptions"
            :update-options="props.updateOptions"
            :group="props.group"
            :loading="props.loading"
            :autoresize="props.autoresize"
        />
        <div
            v-else
            class="caomei-chart__status"
            :role="status === 'failed' ? 'alert' : 'status'"
        >
            {{ status === 'failed' ? locale.chart.loadFailed : locale.chart.loading }}
        </div>
    </div>
</template>

<style scoped>
.caomei-chart {
    /* `min-width: 0` 与内层 `width: 100%` 是承重声明：图表作为 grid / flex 项时不得被内核的
       min-content 撑破父容器（同 `CaomeiRichTextEditor` 的布局契约）。 */
    box-sizing: border-box;
    min-width: 0;
    width: 100%;
    height: var(--caomei-chart-height, 20rem);
}

/* 内核要求容器具备确定尺寸，否则画布高度为 0 */
.caomei-chart__canvas {
    width: 100%;
    height: 100%;
}

.caomei-chart__status {
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding: var(--caomei-space-4);
    border: 1px dashed var(--caomei-color-border);
    border-radius: var(--caomei-radius-md);
    background: var(--caomei-color-bg);
    color: var(--caomei-color-text-muted);
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-font-size-sm);
}
</style>
