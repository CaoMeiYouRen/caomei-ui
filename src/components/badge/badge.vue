<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { labelAttrs } from '../_shared/use-label-attrs'
import type { BadgeProps } from './types'

defineOptions({ name: 'CaomeiBadge', inheritAttrs: false })

const props = withDefaults(defineProps<BadgeProps>(), {
    tone: 'danger',
    variant: 'solid',
    size: 'md',
    dot: false,
})

defineSlots<{
    default?: () => unknown
}>()

const slots = useSlots()
const overlay = computed(() => Boolean(slots.default))

const displayValue = computed(() => {
    if (props.dot) {
        return ''
    }
    const { value, max } = props
    if (value === undefined || value === null || value === '') {
        return ''
    }
    if (typeof value === 'number' && Number.isNaN(value)) {
        return ''
    }
    if (typeof value === 'number' && max !== undefined && value > max) {
        return `${max}+`
    }
    return String(value)
})

const visible = computed(() => props.dot || displayValue.value !== '')

const rootClass = computed(() => [
    `caomei-badge--${props.tone}`,
    `caomei-badge--${props.variant}`,
    `caomei-badge--${props.size}`,
    { 'caomei-badge--dot': props.dot },
])

/** 叠加模式下的偏移样式 */
const offsetStyle = computed(() => {
    if (!overlay.value || !props.offset) {
        return undefined
    }
    const [x, y] = props.offset
    return {
        transform: `translate(calc(50% + ${x}px), calc(-50% + ${y}px))`,
    }
})

const ariaHidden = computed(() => (props.dot && !props.label ? 'true' : undefined))

const ariaRole = computed(() => (props.dot && props.label ? 'img' : undefined))

/** `role` / `aria-hidden` 仅在组件有明确意见时输出，避免以 `undefined` 覆盖消费者透传值。 */
const ariaAttrs = computed<Record<string, string>>(() => ({
    ...(ariaHidden.value ? { 'aria-hidden': ariaHidden.value } : {}),
    ...(ariaRole.value ? { role: ariaRole.value } : {}),
}))
</script>

<template>
    <span
        v-if="overlay"
        class="caomei-badge-wrapper"
        v-bind="$attrs"
    >
        <slot />
        <span
            v-if="visible"
            class="caomei-badge"
            :class="rootClass"
            :style="offsetStyle"
            v-bind="{...labelAttrs(label), ...ariaAttrs}"
        >
            {{ displayValue }}
        </span>
    </span>
    <span
        v-else-if="visible"
        class="caomei-badge"
        :class="rootClass"
        v-bind="{...$attrs, ...labelAttrs(label), ...ariaAttrs}"
    >
        {{ displayValue }}
    </span>
</template>

<style scoped>
.caomei-badge-wrapper {
    position: relative;
    display: inline-flex;
    vertical-align: middle;
}

.caomei-badge {
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--caomei-badge-min-width, 20px);
    height: var(--caomei-badge-height, 20px);
    padding: 0 var(--caomei-badge-padding-x, var(--caomei-space-1));
    border: 1px solid transparent;
    border-radius: 999px;
    font-family: var(--caomei-font-sans);
    font-size: var(--caomei-badge-font-size, var(--caomei-font-size-sm));
    font-variant-numeric: tabular-nums;
    line-height: 1;
    white-space: nowrap;
    vertical-align: middle;
    transition: background-color 0.15s ease, color 0.15s ease, min-width 0.15s ease;
}

.caomei-badge-wrapper > .caomei-badge {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
}

:where(.caomei-badge--primary) {
    --caomei-badge-tone: var(--caomei-color-primary);
    --caomei-badge-solid: var(--caomei-color-primary-solid);
}

:where(.caomei-badge--success) {
    --caomei-badge-tone: var(--caomei-color-success);
    --caomei-badge-solid: var(--caomei-color-success-solid);
}

:where(.caomei-badge--warning) {
    --caomei-badge-tone: var(--caomei-color-warning);
    --caomei-badge-solid: var(--caomei-color-warning-solid);
}

:where(.caomei-badge--danger) {
    --caomei-badge-tone: var(--caomei-color-danger);
    --caomei-badge-solid: var(--caomei-color-danger-solid);
}

:where(.caomei-badge--neutral) {
    --caomei-badge-tone: var(--caomei-color-text-muted);
    --caomei-badge-solid: var(--caomei-color-neutral-solid);
}

.caomei-badge--soft {
    background: color-mix(in srgb, var(--caomei-badge-tone) 12%, transparent);
    color: var(--caomei-badge-tone);
}

.caomei-badge--solid {
    background: var(--caomei-badge-solid);
    color: var(--caomei-color-on-solid);
}

.caomei-badge--outline {
    border-color: var(--caomei-badge-tone);
    color: var(--caomei-badge-tone);
}

:where(.caomei-badge--sm) {
    --caomei-badge-min-width: 16px;
    --caomei-badge-height: 16px;
    --caomei-badge-padding-x: 2px;
    --caomei-badge-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-badge--md) {
    --caomei-badge-min-width: 20px;
    --caomei-badge-height: 20px;
    --caomei-badge-padding-x: var(--caomei-space-1);
    --caomei-badge-font-size: var(--caomei-font-size-sm);
}

:where(.caomei-badge--lg) {
    --caomei-badge-min-width: var(--caomei-control-height-sm);
    --caomei-badge-height: var(--caomei-control-height-sm);
    --caomei-badge-padding-x: var(--caomei-space-2);
    --caomei-badge-font-size: var(--caomei-font-size-md);
}

.caomei-badge--dot {
    width: 8px;
    height: 8px;
    min-width: 0;
    padding: 0;
}

/*
  结构修饰符 `--dot` 保留常规特异性：本复合块须胜过 `.caomei-badge--dot` 自身的 8px；
  尺寸档位部分经 :where() 归零。**本规则依赖源码顺序**——必须排在 `.caomei-badge--dot` 之后（同特异性由源序决胜负）。
*/
.caomei-badge--dot:where(.caomei-badge--lg) {
    width: 10px;
    height: 10px;
}

@media (prefers-reduced-motion: reduce) {
    .caomei-badge {
        transition: none;
    }
}
</style>
