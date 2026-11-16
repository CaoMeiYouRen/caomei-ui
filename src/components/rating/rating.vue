<script setup lang="ts">
import { RatingItem, RatingItemIndicator, RatingRoot } from 'reka-ui'
import { computed, ref, watch } from 'vue'
import { CaomeiIcon, useInternalIcons } from '../../icons'
import { useLocale } from '../../composables/use-locale'
import type { RatingProps } from './types'

defineOptions({ name: 'CaomeiRating' })

const props = withDefaults(defineProps<RatingProps>(), {
    max: 5,
    step: 1,
    readonly: false,
    disabled: false,
    size: 'md',
    label: undefined,
    clearable: false,
})

const model = defineModel<number>({ default: 0 })

const icons = useInternalIcons()
const locale = useLocale()

/** 交互停用：`readonly` 与 `disabled` 都落到 primitive 的 `disabled`（不可聚焦、不可改值） */
const inactive = computed(() => props.disabled || props.readonly)

const rootClass = computed(() => [
    'caomei-rating',
    `caomei-rating--${props.size}`,
    {
        'caomei-rating--readonly': props.readonly,
        'caomei-rating--disabled': props.disabled,
    },
])

const items = computed(() => Array.from({ length: Math.max(1, Math.floor(props.max)) }, (_, index) => index + 1))

/** 分值网格：`0.5` 步进或整星 */
const grid = computed(() => (props.step === 0.5 ? 0.5 : 1))

/** 指针悬停中的分值（用于预览）；离开评分区域即清空 */
const hovered = ref<number | null>(null)

/** 实际用于着色的分值：悬停预览优先，其次模型值，并按网格取整 */
const displayValue = computed(() => {
    const raw = hovered.value ?? model.value
    const value = Number.isFinite(raw) ? raw : 0
    const clamped = Math.min(Math.max(value, 0), items.value.length)
    return Math.round(clamped / grid.value) * grid.value
})

/**
 * 需要着色的 step 集合：每个星条只画「不超过当前分值的最右一格」。
 * 只画这一格是半星正确的前提——把 ≤ 当前分值的所有 step 都着色会叠成整星。
 */
const paintedSteps = computed(() => {
    const painted = new Set<string>()
    const value = displayValue.value
    for (const item of items.value) {
        const step = Math.min(value, item)
        if (step <= item - 1) {
            continue
        }
        painted.add(step.toFixed(2))
    }
    return painted
})

function isPainted(step: number): boolean {
    return paintedSteps.value.has(step.toFixed(2))
}

function hoverStep(step: number): void {
    if (inactive.value) {
        return
    }
    hovered.value = step
}

function resetHover(): void {
    hovered.value = null
}

// 运行期切到只读 / 禁用时清掉残留的悬停预览
watch(inactive, (value) => {
    if (value) {
        resetHover()
    }
})

/** 评分区域的可访问名：显式 `label` 优先，其次按只读 / 可交互取语言兜底文案 */
const accessibleName = computed(() => props.label || (props.readonly ? locale.value.rating.readonlyLabel : locale.value.rating.label))

/** 每个 step 的可访问名按语言模板插值，避免硬编码文案 */
function stepLabel(step: number): string {
    return locale.value.rating.valueLabel.replaceAll('{value}', String(step))
}
</script>

<template>
    <RatingRoot
        v-model="model"
        :length="items.length"
        :step="grid"
        :disabled="inactive"
        :clearable="clearable"
        :hoverable="!inactive"
        :aria-label="accessibleName"
        :aria-readonly="readonly ? 'true' : undefined"
        :class="rootClass"
        @mouseleave="resetHover"
    >
        <RatingItem
            v-for="item in items"
            :key="item"
            :item="item"
            class="caomei-rating__item"
        >
            <template #default="{steps}">
                <!-- 空星底：始终可见，不参与交互与可访问树 -->
                <span class="caomei-rating__backdrop" aria-hidden="true">
                    <CaomeiIcon :icon="icons.star" />
                </span>
                <!--
                  每个 step 一个可交互指示器：宽度 / 透明度 / 层级由 primitive 的 CSS 变量给出，
                  `overflow: hidden` 让填充星按宽度裁切（半星即 50% 宽的那层）；只有最右一格着色。
                -->
                <RatingItemIndicator
                    v-for="value in steps"
                    :key="value"
                    :step="value"
                    class="caomei-rating__step"
                    :data-painted="isPainted(value) ? '' : undefined"
                    :aria-label="stepLabel(value)"
                    @mouseenter="hoverStep(value)"
                >
                    <CaomeiIcon :icon="icons.star" />
                </RatingItemIndicator>
            </template>
        </RatingItem>
    </RatingRoot>
</template>

<style>
/*
  非 scoped：`RatingItem` / `RatingItemIndicator` 的根元素由 Reka 的多层 primitive 渲染，
  scoped 属性不会落到这些节点上（实测 button 无 `data-v-*`），改用命名空间选择器。
*/
.caomei-rating {
    display: inline-flex;
    gap: var(--caomei-rating-gap, var(--caomei-space-1));
    vertical-align: middle;
}

/* 尺寸档位的默认值：基类与三档都用 `:where()` 归零特异性，使用方可直接覆盖 */
:where(.caomei-rating) {
    --caomei-rating-icon-size: var(--caomei-font-size-lg);
}

:where(.caomei-rating--sm) {
    --caomei-rating-icon-size: var(--caomei-font-size-md);
}

:where(.caomei-rating--md) {
    --caomei-rating-icon-size: var(--caomei-font-size-lg);
}

:where(.caomei-rating--lg) {
    --caomei-rating-icon-size: calc(var(--caomei-font-size-lg) * 1.5);
}

.caomei-rating__item {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
    width: var(--caomei-rating-icon-size);
    height: var(--caomei-rating-icon-size);
}

.caomei-rating__backdrop {
    display: inline-flex;
    color: var(--caomei-rating-empty-color, var(--caomei-color-border));
}

.caomei-rating__backdrop svg,
.caomei-rating__step svg {
    width: var(--caomei-rating-icon-size);
    height: var(--caomei-rating-icon-size);
}

.caomei-rating__step {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    display: inline-flex;
    width: var(--reka-rating-item-step-width, 100%);
    overflow: hidden;
    opacity: var(--reka-rating-item-step-opacity, 1);
    z-index: var(--reka-rating-item-step-z-index, 1);
    border: 0;
    padding: 0;
    background: transparent;

    /* 未着色：透明，露出底层的空星 */
    color: transparent;
    cursor: pointer;
    outline: none;
}

/* 只有「不超过当前分值的最右一格」着色，半星即该格被裁到 50% 宽 */
.caomei-rating__step[data-painted] {
    color: var(--caomei-rating-fill-color, var(--caomei-color-primary-text));
}

.caomei-rating__step svg {
    flex-shrink: 0;
}

.caomei-rating__step:focus-visible {
    outline: 2px solid var(--caomei-color-primary);
    outline-offset: 2px;
    border-radius: var(--caomei-radius-sm);
}

.caomei-rating--readonly .caomei-rating__step,
.caomei-rating--disabled .caomei-rating__step {
    cursor: default;
}

.caomei-rating--disabled {
    opacity: var(--caomei-disabled-opacity);
}

/* 动效优先模式：填充颜色过渡（reduce 归零） */
:where([data-motion='expressive']) .caomei-rating__step {
    transition: color var(--caomei-motion-duration-fast) var(--caomei-motion-ease-standard);
}

@media (prefers-reduced-motion: reduce) {
    :where([data-motion='expressive']) .caomei-rating__step {
        transition: none;
    }
}
</style>
