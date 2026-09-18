<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { useLabelAttrs, resolveLabelName } from '../_shared/use-label-attrs'
import type { ProgressSpinnerProps } from './types'

defineOptions({ name: 'CaomeiProgressSpinner', inheritAttrs: false })

const props = withDefaults(defineProps<ProgressSpinnerProps>(), {
    size: 'md',
})

const locale = useLocale()
const attrs = useAttrs()
/** 可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const label = computed(
    () => resolveLabelName(props.label, attrs['aria-label'], locale.value.progress.loading),
)

const forwardedAttrs = useLabelAttrs(() => label.value)

/**
 * 轨道宽度归一化。
 *
 * - 数字：按 px（要求 `0 ≤ n ≤ 1000`）；
 * - 纯数字字符串（PrimeVue 的 `strokeWidth` 默认就写作 `'2'`）：按 px 处理，与数字语义一致；
 * - 其余字符串：**白名单**校验为合法 `border-width`（`<length>` 或 `thin` / `medium` / `thick`），
 *   原样使用（`%` 对 `border-width` 非法，故不接受）；
 * - 空串 / 负数 / 非有限数 / 非法长度 / 超长（> 32 字符）→ `undefined`，回退档位默认。
 *
 * 必须白名单而非黑名单：该变量在 `border` 简写中被消费，写入语义非法值会触发
 * 「invalid at computed-value time」，整条 `border` 声明被丢弃、`border-style: none`，
 * 圆环会**整体消失**而不是回退默认。
 */
const STROKE_WIDTH_RE = /^(?:\d*\.?\d+(?:px|rem|em|ch|ex|vw|vh|vmin|vmax|cm|mm|q|pt|pc|in)|thin|medium|thick)$/

function normalizeStrokeWidth(value: number | string | undefined): string | undefined {
    if (typeof value === 'number') {
        return Number.isFinite(value) && value >= 0 && value <= 1000 ? `${value}px` : undefined
    }
    if (typeof value !== 'string') {
        return undefined
    }
    const trimmed = value.trim().toLowerCase()
    if (!trimmed || trimmed.length > 32) {
        return undefined
    }
    if (/^\d*\.?\d+$/.test(trimmed)) {
        const numeric = Number.parseFloat(trimmed)
        return numeric <= 1000 ? `${numeric}px` : undefined
    }
    return STROKE_WIDTH_RE.test(trimmed) ? trimmed : undefined
}

const strokeWidth = computed(() => normalizeStrokeWidth(props.strokeWidth))

/** 内联自定义属性在层叠中高于作者选择器声明（`:where()` 只是把档位选择器的特异性归零，不是内联生效的原因），故 prop 覆盖档位默认 */
const rootStyle = computed(() =>
    (strokeWidth.value
        ? { '--caomei-progress-spinner-stroke': strokeWidth.value }
        : undefined),
)

const rootClass = computed(() => `caomei-progress-spinner--${props.size}`)
</script>

<template>
    <ProgressRoot
        v-bind="forwardedAttrs"
        :model-value="null"
        :style="rootStyle"
        as="span"
        class="caomei-progress-spinner"
        :class="rootClass"
    >
        <ProgressIndicator
            as="span"
            class="caomei-progress-spinner__indicator"
        />
    </ProgressRoot>
</template>

<style scoped>
/*
  `--caomei-progress-spinner-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，保证使用方单类覆盖生效。
  `strokeWidth` prop 以内联样式写入同名变量，优先级高于此处的档位声明（故 prop 覆盖档位默认）。
*/
.caomei-progress-spinner {
    display: inline-block;
    flex-shrink: 0;
    width: var(--caomei-progress-spinner-size, 24px);
    height: var(--caomei-progress-spinner-size, 24px);
    vertical-align: middle;
}

:where(.caomei-progress-spinner--sm) {
    --caomei-progress-spinner-size: 16px;
    --caomei-progress-spinner-stroke: 2px;
}

:where(.caomei-progress-spinner--md) {
    --caomei-progress-spinner-size: 24px;
    --caomei-progress-spinner-stroke: 2px;
}

:where(.caomei-progress-spinner--lg) {
    --caomei-progress-spinner-size: 32px;
    --caomei-progress-spinner-stroke: 3px;
}

.caomei-progress-spinner__indicator {
    box-sizing: border-box;
    display: block;
    width: 100%;
    height: 100%;
    border: var(--caomei-progress-spinner-stroke, 2px) solid
        var(--caomei-progress-spinner-track, var(--caomei-color-border));
    border-top-color: var(--caomei-progress-spinner-color, var(--caomei-color-primary));
    border-radius: 50%;
    animation: caomei-progress-spinner-spin 0.6s linear infinite;
}

@keyframes caomei-progress-spinner-spin {
    to {
        transform: rotate(360deg);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-progress-spinner__indicator {
        animation-duration: 1.6s;
    }
}
</style>
