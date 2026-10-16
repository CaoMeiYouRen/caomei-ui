<script setup lang="ts">
import { computed, onMounted, ref, shallowRef, useAttrs, watch, type ClassValue, type Component, type StyleValue } from 'vue'
import { useLocale, useLocaleCode } from '../../composables/use-locale'
import { labelAttrs, resolveLabelName } from '../_shared/use-label-attrs'
import { useRootTheme } from '../_shared/use-root-theme'
import { loadChart } from './chart-loader'
import { registerChartLocale, resolveChartLocale } from './chart-locale'
import { buildChartTheme, readChartThemeTokensFromElement } from './chart-theme'
import type { ChartProps } from './types'
import { warnDev } from '../../_shared/dev-warn'

defineOptions({ name: 'CaomeiChart', inheritAttrs: false })

const props = withDefaults(defineProps<ChartProps>(), {
    autoresize: true,
    loading: false,
})

const locale = useLocale()
const localeCode = useLocaleCode()
const { revision } = useRootTheme()
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

/**
 * 主题：显式 `theme` 优先（逃生舱，**运行期变更同样生效**），否则由宿主 `--caomei-*` token 派生。
 *
 * 依赖项有两个：`props.theme`（使用方动态切换主题名 / 主题对象）与 `revision`（根元素主题属性
 * 变化）。写成 `computed` 而非「挂载时算一次 + 手工 watch」，是为了让两条触发路径共用同一份口径
 * ——vue-echarts 本身支持 `theme` 的热切换（`watch(realTheme)` → `setTheme`）。
 * 服务端不读 DOM：`document` 缺失时返回 `undefined`，由内核使用默认主题。
 */
const chartTheme = computed<string | object | undefined>(
    () => props.theme ?? deriveTheme(revision.value),
)

/** 按当前根元素 token 派生主题；`revision` 作为依赖传入（其值不参与计算，仅用于触发重算）。 */
function deriveTheme(_revision: number): string | object | undefined {
    if (typeof document === 'undefined') {
        return undefined
    }
    return buildChartTheme(readChartThemeTokensFromElement(document.documentElement))
}

/** 内核实例键：`locale` 是 `echarts.init` 的初始化参数、无法热更新，语言切换时重建实例。 */
const chartKey = ref(0)
const localeKey = ref<string>()

/**
 * `initOptions`：注入跟随宿主语言的 `locale` 缺省值，显式传入者优先，其余键原样透传。
 */
const mergedInitOptions = computed<Record<string, unknown> | undefined>(() => {
    if (!localeKey.value) {
        return props.initOptions
    }
    return { locale: localeKey.value, ...props.initOptions }
})

const chartStyle = computed(() => (props.height ? { height: props.height } : undefined))

onMounted(async () => {
    localeKey.value = await applyLocale(localeCode.value)

    try {
        const module = await loadChart()
        chartModule.value = module.VChart
        status.value = 'ready'
    } catch (error) {
        status.value = 'failed'
        warnDev(
            `[CaomeiChart] 图表内核加载失败，请确认已安装可选依赖 vue-echarts 及其 peer echarts。${String(error)}`,
        )
    }
})

/** 注册并返回当前语言键；语言包缺失时回落内置语言，不阻断渲染。 */
async function applyLocale(code: Parameters<typeof resolveChartLocale>[0]): Promise<string> {
    const key = resolveChartLocale(code)
    try {
        return await registerChartLocale(key)
    } catch (error) {
        warnDev(`[CaomeiChart] 图表语言包注册失败，回落内置语言：${String(error)}`)
        return key === 'JA' || key === 'KO' ? 'EN' : key
    }
}

// 语言切换：重新注册语言包并**无条件重建实例**——`locale` 是初始化参数无法热更新；且即使
// ECharts 语言键未变（如 zh-CN ↔ zh-TW 同为 `ZH`），使用方基于宿主语言的格式化器（见
// `useChartFormat`）也需要一次重绘才生效。
watch(localeCode, async (code) => {
    localeKey.value = await applyLocale(code)
    chartKey.value += 1
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
            :key="chartKey"
            class="caomei-chart__canvas"
            :option="props.option"
            :theme="chartTheme"
            :init-options="mergedInitOptions"
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
