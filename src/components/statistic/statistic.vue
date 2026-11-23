<script setup lang="ts">
import { computed, useId, useSlots } from 'vue'
import type { StatisticProps, StatisticValue } from './types'

defineOptions({ name: 'CaomeiStatistic' })

const props = withDefaults(defineProps<StatisticProps>(), {
    value: null,
    groupSeparator: ',',
    decimalSeparator: '.',
    prefix: '',
    suffix: '',
    label: '',
    loading: false,
    placeholder: '--',
    size: 'md',
    as: 'div',
})

defineSlots<{
    /** 自定义标签内容 */
    label?: () => unknown
    /** 自定义前缀内容 */
    prefix?: () => unknown
    /** 自定义后缀内容 */
    suffix?: () => unknown
}>()

const slots = useSlots()
const labelId = `caomei-statistic-label-${useId()}`

/** 把入参归一为有限数字；空串与非数字串按空值处理，不做隐式 0。 */
function toFiniteNumber(value: StatisticValue): number | null {
    if (value === null || value === undefined) {
        return null
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null
    }
    const text = value.trim()
    if (!text || !/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i.test(text)) {
        return null
    }
    const parsed = Number(text)
    return Number.isFinite(parsed) ? parsed : null
}

/** 小数位数收窄到 0 ~ 20；非法值视为「未指定」，保留数值自身的小数位。 */
const normalizedPrecision = computed<number | null>(() => {
    const precision = props.precision
    if (typeof precision !== 'number' || !Number.isInteger(precision) || precision < 0 || precision > 20) {
        return null
    }
    return precision
})

const formatted = computed<{ text: string, empty: boolean }>(() => {
    const value = toFiniteNumber(props.value)
    if (value === null) {
        return { text: props.placeholder, empty: true }
    }

    const precision = normalizedPrecision.value
    const raw = precision === null ? String(value) : value.toFixed(precision)
    // 指数形式（如 1e+21）无法按位分组，原样输出
    if (/e/i.test(raw)) {
        return { text: raw, empty: false }
    }

    const negative = raw.startsWith('-')
    const unsigned = negative ? raw.slice(1) : raw
    const [integerPart, fractionPart = ''] = unsigned.split('.')
    const separator = props.groupSeparator
    const grouped = separator
        ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, () => separator)
        : integerPart
    const body = fractionPart ? `${grouped}${props.decimalSeparator}${fractionPart}` : grouped

    return { text: `${negative ? '-' : ''}${body}`, empty: false }
})
</script>

<template>
    <component
        :is="as"
        class="caomei-statistic"
        :class="[
            `caomei-statistic--${size}`,
            {
                'caomei-statistic--empty': formatted.empty,
                'caomei-statistic--loading': loading
            }
        ]"
    >
        <span
            v-if="label || slots.label"
            :id="labelId"
            class="caomei-statistic__label"
        >
            <slot name="label">
                {{ label }}
            </slot>
        </span>
        <span
            class="caomei-statistic__value"
            role="group"
            :aria-busy="loading || undefined"
            :aria-labelledby="label || slots.label ? labelId : undefined"
        >
            <span
                v-if="loading"
                class="caomei-statistic__skeleton"
                aria-hidden="true"
            />
            <template v-else>
                <span
                    v-if="prefix || slots.prefix"
                    class="caomei-statistic__prefix"
                >
                    <slot name="prefix">
                        {{ prefix }}
                    </slot>
                </span>
                <span class="caomei-statistic__number">{{ formatted.text }}</span>
                <span
                    v-if="suffix || slots.suffix"
                    class="caomei-statistic__suffix"
                >
                    <slot name="suffix">
                        {{ suffix }}
                    </slot>
                </span>
            </template>
        </span>
    </component>
</template>

<style scoped>
/*
  `--caomei-statistic-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  尺寸档位选择器用 :where() 归零特异性，只声明 CSS 变量。
*/
.caomei-statistic {
    box-sizing: border-box;
    display: inline-flex;
    flex-direction: column;
    gap: var(--caomei-statistic-gap, var(--caomei-space-1));
    min-width: 0;
    font-family: var(--caomei-font-sans);
    color: var(--caomei-statistic-color, var(--caomei-color-text));
}

.caomei-statistic__label {
    color: var(--caomei-statistic-label-color, var(--caomei-color-text-muted));
    font-size: var(--caomei-statistic-label-size, var(--caomei-font-size-md));
    line-height: 1.4;
}

.caomei-statistic__value {
    display: inline-flex;
    gap: var(--caomei-statistic-value-gap, var(--caomei-space-1));
    align-items: baseline;
    min-width: 0;
    font-size: var(--caomei-statistic-value-size, var(--caomei-font-size-lg));
    font-weight: var(--caomei-statistic-value-weight, 600);
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
    overflow-wrap: anywhere;
}

.caomei-statistic__prefix,
.caomei-statistic__suffix {
    color: var(--caomei-statistic-affix-color, var(--caomei-color-text-muted));
    font-size: var(--caomei-statistic-affix-size, var(--caomei-font-size-md));
    font-weight: var(--caomei-statistic-affix-weight, 400);
}

.caomei-statistic--empty .caomei-statistic__value {
    color: var(--caomei-statistic-empty-color, var(--caomei-color-text-muted));
}

/* 骨架不参与朗读（aria-hidden 由模板承担）；静态块，避免为加载态新增循环动画节奏 */
.caomei-statistic__skeleton {
    display: block;
    box-sizing: border-box;
    width: var(--caomei-statistic-skeleton-width, 4rem);
    height: 1em;
    border-radius: var(--caomei-statistic-skeleton-radius, var(--caomei-radius-sm));
    background: var(--caomei-statistic-skeleton-bg, var(--caomei-color-bg-elevated));
}

:where(.caomei-statistic--sm) {
    --caomei-statistic-value-size: var(--caomei-font-size-md);
    --caomei-statistic-label-size: var(--caomei-font-size-sm);
}

:where(.caomei-statistic--md) {
    --caomei-statistic-value-size: var(--caomei-font-size-lg);
    --caomei-statistic-label-size: var(--caomei-font-size-md);
}

:where(.caomei-statistic--lg) {
    --caomei-statistic-value-size: var(--caomei-font-size-xl, 20px);
    --caomei-statistic-label-size: var(--caomei-font-size-md);
}
</style>
