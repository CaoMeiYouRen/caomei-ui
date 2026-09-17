<script setup lang="ts">
import { ProgressIndicator, ProgressRoot } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { resolveLabelName, useLabelAttrs } from '../_shared/use-label-attrs'
import type { ProgressBarProps } from './types'

defineOptions({ name: 'CaomeiProgressBar', inheritAttrs: false })

const props = withDefaults(defineProps<ProgressBarProps>(), {
    value: null,
    max: 100,
    size: 'md',
})

const locale = useLocale()
const attrs = useAttrs()
/** 可访问名优先级：显式 `label` > 透传 `aria-label` > 语言兜底文案 */
const label = computed(() => resolveLabelName(props.label, attrs['aria-label'], locale.value.progress.bar))

/** 非正 / 非有限的 max 归一为默认值，避免 Reka 告警 */
const normalizedMax = computed(() => (Number.isFinite(props.max) && props.max > 0 ? props.max : 100))

/** 收窄为合法值，避免 Reka 对越界 / 非有限值告警 */
const normalizedValue = computed<number | null>(() => {
    const value = props.value
    if (value === null || !Number.isFinite(value)) {
        return null
    }
    return Math.min(normalizedMax.value, Math.max(0, value))
})

const percentage = computed(() => {
    if (normalizedValue.value === null) {
        return null
    }
    // 规整为有限小数，避免非整除量程产生过长的小数字符串
    return Number(((normalizedValue.value / normalizedMax.value) * 100).toFixed(4))
})

const forwardedAttrs = useLabelAttrs(label)
</script>

<template>
    <ProgressRoot
        v-bind="forwardedAttrs"
        :model-value="normalizedValue"
        :max="normalizedMax"
        as="div"
        class="caomei-progress-bar"
        :class="`caomei-progress-bar--${size}`"
    >
        <ProgressIndicator
            as="div"
            class="caomei-progress-bar__indicator"
            :style="percentage === null ? undefined : {width: `${percentage}%`}"
        />
    </ProgressRoot>
</template>

<style scoped>
/*
  `--caomei-progress-bar-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-progress-bar {
    position: relative;
    display: block;
    overflow: hidden;
    width: var(--caomei-progress-bar-width, 100%);
    height: var(--caomei-progress-bar-height, 8px);
    border-radius: var(--caomei-progress-bar-radius, 999px);
    background: var(--caomei-progress-bar-track, var(--caomei-color-border));
}

:where(.caomei-progress-bar--sm) {
    --caomei-progress-bar-height: 4px;
}

:where(.caomei-progress-bar--md) {
    --caomei-progress-bar-height: 8px;
}

:where(.caomei-progress-bar--lg) {
    --caomei-progress-bar-height: 12px;
}

.caomei-progress-bar__indicator {
    height: 100%;
    border-radius: inherit;
    background: var(--caomei-progress-bar-color, var(--caomei-color-primary));
    transition: width 0.3s ease;
}

.caomei-progress-bar[data-state='indeterminate'] .caomei-progress-bar__indicator {
    width: 40%;
    animation: caomei-progress-bar-indeterminate 1.4s ease-in-out infinite;
}

@keyframes caomei-progress-bar-indeterminate {
    0% {
        transform: translateX(-150%);
    }

    100% {
        transform: translateX(350%);
    }
}

@media (prefers-reduced-motion: reduce) {
    .caomei-progress-bar__indicator {
        transition: none;
    }

    .caomei-progress-bar[data-state='indeterminate'] .caomei-progress-bar__indicator {
        animation-duration: 2.4s;
    }
}
</style>
