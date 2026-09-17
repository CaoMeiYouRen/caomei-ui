<script setup lang="ts">
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, useAttrs } from 'vue'
import { useLocale } from '../../composables/use-locale'
import { resolveLabelName } from '../_shared/use-label-attrs'
import type { SliderProps, SliderValue } from './types'

defineOptions({ name: 'CaomeiSlider', inheritAttrs: false })

const props = withDefaults(defineProps<SliderProps>(), {
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    orientation: 'horizontal',
    inverted: false,
    minStepsBetweenThumbs: 0,
    label: '',
})

const emit = defineEmits<{
    /** 交互结束、值确定时触发 */
    change: [value: SliderValue]
}>()

const model = defineModel<SliderValue | undefined>()

const attrs = useAttrs()

/** 描述性 ARIA 属性需落到可聚焦的滑块上，根节点为不可聚焦容器 */
const thumbSharedAttrs = computed<Record<string, unknown>>(() => {
    const shared: Record<string, unknown> = {}
    for (const key of ['aria-describedby', 'aria-labelledby'] as const) {
        if (attrs[key] !== undefined) {
            shared[key] = attrs[key]
        }
    }
    return shared
})

/** 绑定数组（或非受控初值为数组）时按范围滑块处理，否则为单滑块 */
const isRange = computed(() => Array.isArray(model.value) || Array.isArray(props.defaultValue))

const normalizedModel = computed<number[] | undefined>(() => {
    if (model.value === undefined) {
        return undefined
    }
    return Array.isArray(model.value) ? [...model.value] : [model.value]
})

/** 未受控且未显式给初值时，以 min 作为初始值，避免 Reka 默认的 0 低于 min */
const normalizedDefault = computed<number[] | undefined>(() => {
    if (props.defaultValue !== undefined) {
        return Array.isArray(props.defaultValue) ? [...props.defaultValue] : [props.defaultValue]
    }
    return model.value === undefined ? [props.min] : undefined
})

const thumbCount = computed(() => {
    const value = model.value ?? props.defaultValue
    return Array.isArray(value) ? Math.max(1, value.length) : 1
})

const locale = useLocale()
const messages = computed(() => locale.value.slider)

function resolveThumbLabel(index: number, count: number): string | undefined {
    if (props.thumbLabels?.[index]) {
        return props.thumbLabels[index]
    }
    if (count === 1) {
        return resolveLabelName(props.label, attrs['aria-label'], messages.value.thumb)
    }
    if (count === 2) {
        return index === 0 ? messages.value.minimum : messages.value.maximum
    }
    return `${messages.value.thumb} ${index + 1}`
}

function normalizeOutgoing(values: number[]): SliderValue {
    return isRange.value ? values : values[0]
}

function handleUpdate(values: number[] | undefined): void {
    if (!values || values.length === 0) {
        return
    }
    model.value = normalizeOutgoing(values)
}

function handleCommit(values: number[]): void {
    if (values.length > 0) {
        emit('change', normalizeOutgoing(values))
    }
}
</script>

<template>
    <SliderRoot
        v-bind="$attrs"
        :model-value="normalizedModel"
        :default-value="normalizedDefault"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :orientation="orientation"
        :dir="dir"
        :inverted="inverted"
        :min-steps-between-thumbs="minStepsBetweenThumbs"
        :name="name"
        :required="required || undefined"
        class="caomei-slider"
        :class="[`caomei-slider--${orientation}`, {'caomei-slider--disabled': disabled}]"
        @update:model-value="handleUpdate"
        @value-commit="handleCommit"
    >
        <SliderTrack class="caomei-slider__track">
            <SliderRange class="caomei-slider__range" />
        </SliderTrack>
        <SliderThumb
            v-for="index in thumbCount"
            :key="index"
            v-bind="thumbSharedAttrs"
            class="caomei-slider__thumb"
            :aria-label="resolveThumbLabel(index - 1, thumbCount)"
        />
    </SliderRoot>
</template>

<style scoped>
/*
  `--caomei-slider-*` 只作为覆盖钩子（消费处带默认回退值），基类不预声明默认值；
  轨道 / 已选区间 / 滑块的位置由 Reka 以内联样式驱动，此处只负责视觉呈现。
*/
.caomei-slider {
    position: relative;
    display: inline-flex;
    flex: 1 1 auto;
    align-items: center;
    width: var(--caomei-slider-width, 100%);
    min-width: var(--caomei-slider-min-width, 120px);
    touch-action: none;
    user-select: none;
}

.caomei-slider--vertical {
    flex-direction: column;
    width: auto;
    height: var(--caomei-slider-height, 10rem);
    min-width: 0;
}

.caomei-slider__track {
    position: relative;
    flex: 1 1 auto;
    height: var(--caomei-slider-track-height, 6px);
    border-radius: var(--caomei-slider-track-radius, 999px);
    background: var(--caomei-slider-track-bg, var(--caomei-color-border));
}

.caomei-slider--vertical .caomei-slider__track {
    width: var(--caomei-slider-track-height, 6px);
    height: 100%;
}

.caomei-slider__range {
    position: absolute;
    border-radius: inherit;
    background: var(--caomei-slider-range-bg, var(--caomei-color-primary));
}

.caomei-slider--horizontal .caomei-slider__range {
    top: 0;
    bottom: 0;
}

.caomei-slider--vertical .caomei-slider__range {
    right: 0;
    left: 0;
}

.caomei-slider__thumb {
    box-sizing: border-box;
    display: block;
    width: var(--caomei-slider-thumb-size, 18px);
    height: var(--caomei-slider-thumb-size, 18px);
    border: 2px solid var(--caomei-slider-thumb-border, var(--caomei-color-primary));
    border-radius: 50%;
    background: var(--caomei-slider-thumb-bg, var(--caomei-color-bg));
    box-shadow: var(--caomei-slider-thumb-shadow, var(--caomei-shadow-xs));
    cursor: grab;
}

.caomei-slider__thumb:focus-visible {
    outline: 2px solid var(--caomei-slider-focus, var(--caomei-color-primary));
    outline-offset: 2px;
}

.caomei-slider--disabled {
    opacity: var(--caomei-disabled-opacity);
}

.caomei-slider--disabled .caomei-slider__thumb {
    cursor: not-allowed;
}
</style>
